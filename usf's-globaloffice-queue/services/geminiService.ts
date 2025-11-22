import { GoogleGenAI, Type } from "@google/genai";
import { Student } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Generates a realistic mock student identity and issue.
 */
export const generateMockStudent = async (): Promise<Partial<Student> | null> => {
  try {
    const prompt = `Generate a realistic university student profile for a check-in system at the University of South Florida Global Student Center.
    
    You MUST RANDOMLY select one of the following departments:
    1. Education Abroad
    2. International Admissions
    3. Global Learning
    4. International Student Support

    The 'problem' and 'tag' MUST be consistent with the department:
    - International Admissions: Categories: "Resolve Registration Holds", "Drop off Transcripts", "Check Application Status".
    - Education Abroad: Categories: "Program Inquiry", "Application Help", "Scholarship & Funding".
    - Intl Student Support: Categories: "I-20 Travel Signature", "Visa Status Update", "OPT/CPT Inquiry".
    - Global Learning: Categories: "Global Citizens Award", "Peace Corps Info".

    Return a JSON object with:
    - name (Full Name, diverse international names)
    - universityId (Format: U-number e.g., U12345678)
    - department (The randomly selected department)
    - problem (The specific scenario detail)
    - tag (The category chosen from the list above)
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            universityId: { type: Type.STRING },
            department: { type: Type.STRING },
            problem: { type: Type.STRING },
            tag: { type: Type.STRING },
          },
          required: ["name", "universityId", "department", "problem", "tag"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text);
    // Format for app consumption (array of strings for tags)
    return {
        ...data,
        tags: [data.tag]
    } as Partial<Student>;

  } catch (error) {
    console.error("Error generating mock student:", error);
    return null;
  }
};
