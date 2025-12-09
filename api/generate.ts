import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
    runtime: 'edge', // Optional: Use Edge if preferred, but Node is fine for AI calls usually. Node is better for full compatibility.
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text, context } = await req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text content is required' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const textOutput = response.text();

        // Simple cleanup to ensure JSON parsing if markdown blocks are included
        const jsonString = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();

        const quizData = JSON.parse(jsonString);

        return res.status(200).json(quizData);

    } catch (error) {
        console.error('Quiz generation error:', error);
        return res.status(500).json({ error: 'Failed to generate quiz', details: error.message });
    }
}
