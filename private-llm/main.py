import os
import torch
from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

app = FastAPI(title="Private PRD-LLM (Local GPU Engine)")

print("🚀 Loading REAL Local LLM onto GPU (Qwen2.5 0.5B)...")
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"

try:
    generator = pipeline(
        "text-generation",
        model=MODEL_NAME,
        torch_dtype=torch.float16,
        device_map="auto"
    )
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"⚠️ Error loading model: {e}")
    generator = None

class GenerateRequest(BaseModel):
    prompt: str
    max_length: int = 512

@app.post("/generate")
async def generate(req: GenerateRequest):
    if not generator:
        return {"text": "[Error: Local model failed to load]", "confidence": 0.0, "source": "local-prd-llm"}
    
    try:
        messages = [{"role": "user", "content": req.prompt}]
        prompt = generator.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        
        outputs = generator(
            prompt,
            max_new_tokens=req.max_length,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        
        # Extract the response part strictly after the prompt
        gen_text = outputs[0]["generated_text"][len(prompt):].strip()
        return {"text": gen_text, "confidence": 0.95, "source": "local-prd-llm"}
    except Exception as e:
        return {"text": f"[Inference Error: {e}]", "confidence": 0.0, "source": "error"}

@app.get("/")
def health():
    return {"status": "ok", "model": MODEL_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
