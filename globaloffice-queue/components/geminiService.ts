import { GoogleGenAI, Type } from "@google/genai";
import { Department, Student, AIAnalysisResult } from "../types";

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

    The 'problem' MUST be a specific, realistic scenario based on the chosen department:
    - International Admissions: "Need to drop off official transcripts", "Resolve registration holds", "Check application status", "Submit missing documents".
    - Education Abroad: "Inquiry about a program in Italy", "Need help with exchange application", "Scholarship funding question", "Course equivalency form".
    - Intl Student Support: "I-20 travel signature", "OPT/CPT workshop inquiry", "Visa status update", "Social security letter request".
    - Global Learning: "Global Citizens Award info", "Peace Corps prep", "GCP portfolio review".

    Return a JSON object with:
    - name (Full Name, diverse international names)
    - universityId (Format: U-number e.g., U12345678)
    - department (The randomly selected department)
    - problem (The specific scenario)
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
          },
          required: ["name", "universityId", "department", "problem"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as Partial<Student>;
  } catch (error) {
    console.error("Error generating mock student:", error);
    return null;
  }
};

/**
 * Analyzes a student's problem text to provide tags, priority, and a short summary.
 */
export const analyzeTicket = async (problemText: string): Promise<AIAnalysisResult | null> => {
  try {
    const prompt = `Analyze the following student inquiry for an international office dashboard.
    Inquiry: "${problemText}"

    Tasks:
    1. Generate 1-3 short keyword tags. Use STANDARD categories if applicable: 
       - "Resolve Holds", "Transcripts", "Application Help", "Visa/I-20", "Travel Sig", "Funding", "Program Info".
    2. Determine priority level (High, Medium, Low). Visa/Legal deadlines are High. General info is Low.
    3. Create a very brief summary (max 6 words).
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            summary: { type: Type.STRING },
          },
          required: ["tags", "priority", "summary"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as AIAnalysisResult;
  } catch (error) {
    console.error("Error analyzing ticket:", error);
    // Fallback if AI fails
    return {
      tags: ["General Inquiry"],
      priority: "Medium",
      summary: "Check details",
    };
  }
};