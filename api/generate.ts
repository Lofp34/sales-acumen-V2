import { GoogleGenAI } from "@google/genai";

function extractJson(text: string) {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) {
    throw new Error("No JSON object found in model response.");
  }
  return cleaned.slice(first, last + 1);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { text, context } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text content is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Server configuration error: Missing API Key" });
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const prompt = `
      You are an expert educational designer. 
      Analyze the following training transcript/text and generate a multiple-choice quiz (10 questions) to validate the learner's understanding.
      
      Context/Additional Instructions: ${context || "None"}
      
      The output must be strictly valid JSON with the following structure:
      {
        "title": "Suggested Quiz Title",
        "description": "Short description of what is evaluated.",
        "questions": [
          {
            "question": "Question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctAnswerIndex": 0, // 0-3
            "explanation": "Why this is correct"
          }
        ]
      }

      Text to analyze:
      ${text}
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty response from Gemini.");
    }

    const jsonString = extractJson(textOutput);
    const quizData = JSON.parse(jsonString);

    return res.status(200).json(quizData);
  } catch (error) {
    console.error("Quiz generation error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate quiz", details: error.message });
  }
}
