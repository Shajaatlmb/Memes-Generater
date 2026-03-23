import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateMeme(prompt: string, category: string) {
  const model = "gemini-2.5-flash-image";
  
  const fullPrompt = `Generate a funny meme image for the category "${category}". 
  The theme is: ${prompt}. 
  The image should have a classic meme aesthetic with bold text if appropriate, or just a funny visual situation. 
  Make it relatable and shareable.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        {
          text: fullPrompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64EncodeString = part.inlineData.data;
      return `data:image/png;base64,${base64EncodeString}`;
    }
  }
  
  throw new Error("No image generated");
}
