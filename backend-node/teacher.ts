import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

export class TeacherManager {
  async askTeachersSequentially(query: string) {
    // 1. Gemini
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.0-flash-exp" // Use available stable model name
        });
        const result = await model.generateContent(query);
        const response = await result.response;
        return { answer: response.text(), source: 'Gemini' };
      } catch (e) {
        console.warn('[Teacher] Gemini failed:', e);
      }
    }

    // 2. Groq (simplified)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      try {
        const { default: Groq } = await import('groq-sdk');
        const groq = new (Groq as any)({ apiKey: groqKey });
        const completion = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: query }],
          max_tokens: 1024,
        });
        const answer = completion.choices[0]?.message?.content || '';
        if (answer) return { answer, source: 'Groq (Llama 3.3)' };
      } catch (e) {
        console.warn('[Teacher] Groq failed:', e);
      }
    }

    // Fallback logic
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const { default: OpenAI } = await import('openai');
        const client = new (OpenAI as any)({ apiKey: openaiKey });
        const response = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: query }],
        });
        const answer = response.choices[0]?.message?.content || '';
        if (answer) return { answer, source: 'OpenAI GPT-4o-mini' };
      } catch (e) {
        console.warn('[Teacher] OpenAI failed:', e);
      }
    }

    // 3. Fallback to Local Ollama
    try {
      const ollamaRes = await axios.post(`${process.env.OLLAMA_HOST || 'http://localhost:11434'}/api/generate`, {
        model: 'qwen2.5-coder:7b',
        prompt: query,
        stream: false
      });
      return { answer: ollamaRes.data.response, source: 'Ollama' };
    } catch (e) {}

    return null;
  }
}
