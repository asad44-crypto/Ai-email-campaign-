
import { GoogleGenAI, Type, Chat } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const campaignContentSchema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "A compelling, concise email subject line (max 15 words)."
    },
    body: {
      type: Type.STRING,
      description: "The full email body copy, formatted with markdown. It should be engaging, persuasive, and include a clear call to action."
    },
    imagePrompt: {
        type: Type.STRING,
        description: "A detailed, descriptive prompt for an image generator to create a relevant and visually appealing marketing image for the email. This should describe a scene, not just keywords."
    }
  },
  required: ['subject', 'body', 'imagePrompt']
};

export async function generateCampaignContent(prompt: string): Promise<{ subject: string; body: string; imagePrompt: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a complete email marketing campaign based on this prompt: "${prompt}". The tone should be professional yet engaging.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: campaignContentSchema,
      },
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating campaign content:", error);
    throw new Error("Failed to generate campaign text. The model might be unavailable or the request was invalid.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Create a photorealistic, high-quality marketing image for an email campaign. Prompt: ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '16:9',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        } else {
            throw new Error("No image was generated.");
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. The model might be unavailable or the prompt was rejected.");
    }
}

export function startChat(): Chat {
    return ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
          systemInstruction: 'You are a friendly and helpful marketing assistant. Your role is to help users refine their email campaigns. You can suggest alternative copy, answer marketing questions, or brainstorm ideas. Keep your responses concise and actionable.',
      },
    });
}
