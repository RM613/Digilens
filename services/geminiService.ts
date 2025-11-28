import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Converts a File object to a base64 string suitable for Gemini API.
 */
const fileToPart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const identifyHandwrittenNumber = async (imageFile: File): Promise<AnalysisResult> => {
  try {
    const base64Data = await fileToPart(imageFile);
    
    const prompt = `
      Analyze this image which contains a handwritten number. 
      Identify the digit(s) written in the image.
      
      Return the response in this specific JSON format without markdown code blocks:
      {
        "digit": "The identified number (or '?' if unclear)",
        "confidence": "High" | "Medium" | "Low",
        "explanation": "A very brief 1 sentence description of what you see."
      }
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data
            }
          },
          {
            text: prompt
          }
        ]
      },
      config: {
        responseMimeType: "application/json" 
      }
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("No response received from Gemini.");
    }

    try {
      const parsed = JSON.parse(responseText);
      return {
        digit: parsed.digit,
        confidence: parsed.confidence,
        explanation: parsed.explanation
      };
    } catch (e) {
      console.error("Failed to parse JSON", responseText);
      return {
        digit: "?",
        confidence: "Low",
        explanation: "Could not parse the AI response."
      };
    }

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};