import { GoogleGenAI, Type } from "@google/genai";
import OpenAI from "openai";

export interface AIResult {
  title: string;
  tags: string[];
}

export async function generateNoteMetadata(
  content: string, 
  apiKey: string, 
  provider: 'gemini' | 'openai' = 'gemini'
): Promise<AIResult> {
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(`AI features are not configured. Please add your ${provider === 'gemini' ? 'Gemini' : 'OpenAI'} API key in the settings.`);
  }

  const prompt = `Based on the following note content, generate a short, creative title (max 5 words) and 3 relevant hashtags. Return ONLY a valid JSON object with "title" and "tags" fields. Content: ${content}`;

  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A short, creative title (max 5 words)" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3 relevant hashtags" }
          },
          required: ["title", "tags"]
        },
        temperature: 0.7,
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini. This might be due to safety filters or an invalid API key.");
    }

    return parseAIResponse(response.text);
  } else {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant that generates metadata for notes. Always return valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const text = response.choices[0].message.content;
    if (!text) {
      throw new Error("Empty response from OpenAI.");
    }

    return parseAIResponse(text);
  }
}

function parseAIResponse(text: string): AIResult {
  let jsonStr = text.trim();
  
  // Remove markdown code blocks if present
  if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  
  try {
    const data = JSON.parse(jsonStr);
    return {
      title: data.title || "Untitled Note",
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
