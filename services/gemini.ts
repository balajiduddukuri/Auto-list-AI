import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductListing, StoryboardScene } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for the product listing JSON output
const listingSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "SEO optimized product title for Amazon/Shopify (max 200 chars).",
    },
    bullets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 compelling bullet points highlighting features and benefits.",
    },
    description: {
      type: Type.STRING,
      description: "HTML formatted product description (use <p>, <b>, <ul> tags).",
    },
    keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 10 backend search keywords.",
    },
    suggestedPrice: {
      type: Type.STRING,
      description: "A suggested price range based on the product type (e.g., '$20 - $30').",
    },
  },
  required: ["title", "bullets", "description", "keywords", "suggestedPrice"],
};

const storyboardSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      sceneNumber: { type: Type.INTEGER },
      startFramePrompt: { type: Type.STRING, description: "Highly detailed description of the environment/scene setup (80+ words), NO product visible." },
      endFramePrompt: { type: Type.STRING, description: "Highly detailed description of the same scene but now containing the product (80+ words)." },
      videoMotionPrompt: { type: Type.STRING, description: "Prompt describing the action/movement that happens between the start and end frame." }
    },
    required: ["sceneNumber", "startFramePrompt", "endFramePrompt", "videoMotionPrompt"]
  }
};

export const analyzeImage = async (base64Image: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            }
          },
          {
            text: "Analyze this product image. Identify the product type, key materials, visible features, colors, and potential target audience. Keep it concise."
          }
        ]
      }
    });
    return response.text || "Could not analyze image.";
  } catch (error) {
    console.error("Image analysis failed:", error);
    throw new Error("Failed to analyze image.");
  }
};

export const generateListing = async (
  productName: string,
  tone: string,
  additionalContext: string,
  imageBase64?: string,
  imageMime?: string
): Promise<ProductListing> => {
  try {
    const parts: any[] = [];

    // If there is an image, we use it to ground the generation
    if (imageBase64 && imageMime) {
      parts.push({
        inlineData: {
          data: imageBase64,
          mimeType: imageMime
        }
      });
      parts.push({
        text: `Create a product listing for this item. Product Name: "${productName}". Tone: ${tone}. Additional Context: ${additionalContext}. Rely heavily on the visual details in the image.`
      });
    } else {
      parts.push({
        text: `Create a high-converting product listing. Product Name: "${productName}". Tone: ${tone}. Additional Context: ${additionalContext}.`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: listingSchema,
        systemInstruction: "You are an expert e-commerce copywriter. You write SEO-optimized, persuasive content for Amazon and Shopify listings.",
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as ProductListing;

  } catch (error) {
    console.error("Listing generation failed:", error);
    throw new Error("Failed to generate listing. Please try again.");
  }
};

// --- Marketing / Storyboard Services ---

export const generateMarketingConcepts = async (productName: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 3 distinct, creative video ad concepts for a product called "${productName}". 
      One should be "Guerrilla Marketing" style (product dropped in unexpected places).
      One should be "Lifestyle/Aspirational".
      One should be "Technical/Feature-focused".
      Return ONLY the 3 concept titles and a 1-sentence description for each, formatted as a simple JSON list of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Concept generation failed", error);
    return ["Guerrilla Marketing: Product appears in unexpected global locations.", "Lifestyle: Daily life improved by the product.", "Showcase: High-energy feature highlight."];
  }
};

export const generateStoryboard = async (productName: string, concept: string): Promise<StoryboardScene[]> => {
  try {
    const prompt = `I want to make an ad for ${productName} a 5 scene ad in the concept of: ${concept}. 
    The main idea is about being dropped in various places on earth, from Deserts, Icebergs, Even the ocean, and many more.
    In total I want to get 5 scenes.
    Each scene's starting image should just have the environment and not the product.
    The last scene should have the product in the scene.
    I want you to give me highly detailed prompts (at least 80 words) describing each scene, and then a video prompt for what's going to happen between the start and the end frame.
    
    You will get:
    a. Start Frame Image prompt
    b. End Frame Image prompt
    c. Middle motion video prompt`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: storyboardSchema,
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Storyboard generation failed", error);
    throw new Error("Failed to generate storyboard.");
  }
};

export const generateSceneImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // Nano Banana doesn't support aspect ratio config in the text request easily via SDK params usually,
        // but prompt engineering helps.
      }
    });

    // Check all parts for inline data
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
      for (const part of candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed", error);
    throw error;
  }
};