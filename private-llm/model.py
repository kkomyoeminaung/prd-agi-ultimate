# Stub for ML weights. 
# Replaced by transformers quantization in prod.
import random

class MinimalModel:
    def __init__(self):
        self.weights = {"base": random.random()}
    def forward(self, tensor):
        return {"result": tensor * self.weights["base"]}
