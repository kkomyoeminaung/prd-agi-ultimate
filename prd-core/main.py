from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import numpy as np
from engine import PRDLLMEngine

app = FastAPI(title="PRD Core Engine")
llm_engine = PRDLLMEngine()

class TensorRequest(BaseModel):
    text: str

class MergeRequest(BaseModel):
    t1: dict
    t2: dict

@app.get("/")
async def root():
    return {"status": "PRD Core is running"}

@app.post("/tensor/process")
async def process_tensor(req: TensorRequest):
    # Ported from prd-llm-v1.0 RelationalTensor logic
    # Simplified simulation of 6-D tensor (C,W,L,T,U,D)
    tensor = {
        "C": np.random.uniform(0.6, 0.9),
        "W": 1.5,
        "L": "Self-Reflection",
        "T": 0.9,
        "U": np.random.uniform(0.0, 0.4),
        "D": 1
    }
    return {"tensor": tensor, "text": req.text}

@app.post("/core/reason")
async def core_reason(req: TensorRequest):
    # Call the advanced engine CoT
    reasoning = llm_engine.reason_chain(req.text)
    return reasoning

@app.get("/core/summary")
async def get_summary():
    return {"summary": "Core manifold is stable", "curvature": 0.12}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
