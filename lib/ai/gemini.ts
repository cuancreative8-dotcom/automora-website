import { GoogleGenAI } from "@google/genai";
import type { AIResponsePrompt } from "./response-engine";

const MODEL_NAME = "gemini-3.6-flash";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY belum dikonfigurasi pada environment."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

export type GeminiResponse = {
  text: string;
};

export async function generateGeminiResponse(
  prompt: AIResponsePrompt
): Promise<GeminiResponse> {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt.conversationContext,
    config: {
      systemInstruction: prompt.systemInstruction,
      temperature: 0.4,
      maxOutputTokens: 500,
    },
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini tidak menghasilkan respons.");
  }

  return {
    text,
  };
}