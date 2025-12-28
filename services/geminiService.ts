import { GoogleGenAI, Type, SchemaType } from "@google/genai";
import { Topic, Category, Source } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface RawGeminiResponse {
  name: string;
  category: Category;
  startYear: number;
  endYear: number | null;
  summary: string;
  isEstimated: boolean;
}

// We return a Partial topic because ID and Status are handled by the App component
export const fetchTopicData = async (query: string): Promise<Omit<Topic, 'id' | 'status'>> => {
  try {
    const prompt = `
      Analyze the topic '${query}'.
      
      I need accurate historical or factual dates for this topic.
      Use Google Search to verify the start and end years.
      
      Return a JSON object with the following structure:
      {
        "name": "Canonical Name of Topic",
        "category": "One of: History, Technology, Science, Art, Nature, Pop Culture, Other",
        "startYear": number (negative for BC, e.g. -500),
        "endYear": number or null (null if it is still ongoing or present day),
        "summary": "A concise 15-20 word description.",
        "isEstimated": boolean (true if exact dates are debated or unclear)
      }

      Strictly follow the JSON format. Do not include markdown formatting like \`\`\`json.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // 1. Extract JSON from the text response
    const text = response.text || "";
    // Find the first '{' and last '}' to isolate JSON
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error("Failed to parse AI response: No JSON object found.");
    }

    const jsonString = text.substring(firstBrace, lastBrace + 1);
    let data: RawGeminiResponse;
    try {
      data = JSON.parse(jsonString);
    } catch (e) {
      console.error("JSON Parse Error", e, jsonString);
      throw new Error("AI returned invalid JSON.");
    }

    // 2. Extract Grounding Sources
    const sources: Source[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      });
    }

    // Validate Category
    const validCategories: Category[] = ['History', 'Technology', 'Science', 'Art', 'Nature', 'Pop Culture', 'Other'];
    const category = validCategories.includes(data.category) ? data.category : 'Other';

    return {
      name: data.name,
      category: category,
      startYear: data.startYear,
      endYear: data.endYear,
      summary: data.summary,
      isEstimated: data.isEstimated,
      sources: sources.slice(0, 3) // Limit to top 3 sources
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const fetchSuggestions = async (topics: Topic[]): Promise<string[]> => {
  if (topics.length === 0) return [];

  // Create a context string from existing topics
  const context = topics
    .map(t => `${t.name} (${t.startYear} to ${t.endYear || 'Present'})`)
    .join(", ");

  const prompt = `
    The user is building a timeline with the following topics:
    ${context}

    Your goal is to suggest 4 **broad, thematic topics** or **historical eras** that expand this timeline.
    
    CRITICAL GUIDELINES:
    1. **Generalize**: Identify the underlying theme (e.g. if topics are "Cars" and "Bikes", the theme is "Transportation"). Suggest other major eras in that theme (e.g. "The Railway Age", "Age of Sail", "Commercial Aviation").
    2. **Broad Scope**: Avoid specific inventions (e.g. "Seatbelt"), specific product models (e.g. "Ford Model T"), or specific years. Prioritize topics that span decades or centuries.
    3. **Contextual Fit**: Suggestions should be historically significant and comparable in scale to the existing topics.
    4. **Distinct**: Do not duplicate concepts already on the timeline.

    Return a JSON array of 4 strings (names only).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    return [];
  }
};