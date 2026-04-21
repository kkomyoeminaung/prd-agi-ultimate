import os
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Private LLM Gateway")

class GenerateRequest(BaseModel):
    prompt: str
    max_length: int = 512

@app.post("/generate")
async def generate(req: GenerateRequest):
    gemini_key = os.environ.get("GEMINI_API_KEY")
    if gemini_key:
        try:
            import httpx
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key={gemini_key}",
                    json={"contents": [{"parts": [{"text": req.prompt}]}]},
                    timeout=30
                )
                data = res.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {"text": text, "confidence": 0.95, "source": "gemini"}
        except Exception as e:
            return {"text": f"[LLM Error: {e}]", "confidence": 0.0}
    
    # Fallback stub
    return {
        "text": f"[PRD-LLM Stub] Processed: {req.prompt[:50]}...",
        "confidence": 0.3,
        "source": "stub"
    }

@app.get("/")
def health():
    return {"status": "ok", "model": "PRD-LLM Gateway"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
