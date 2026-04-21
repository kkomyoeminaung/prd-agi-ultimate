import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import axios from "axios";

export class TeacherManager {
  async askTeachersSequentially(query: string) {
    // 1. Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const result = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: query
        });
        return { answer: result.text, source: 'Gemini' };
      } catch (e) {}
    }

    // 2. Groq (simplified)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      // Logic for Groq
    }

    // 3. Fallback to Local Ollama
    try {
      const ollamaRes = await axios.post(`${process.env.OLLAMA_HOST}/api/generate`, {
        model: 'qwen2.5-coder:7b',
        prompt: query,
        stream: false
      });
      return { answer: ollamaRes.data.response, source: 'Ollama' };
    } catch (e) {}

    return null;
  }
}
