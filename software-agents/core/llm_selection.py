def get_optimal_llm(task_complexity: int, strict_latency: bool = False):
    """Cost-Aware & Latency-Aware LLM Routing"""
    # Pseudo-logic tracking offline modes, cost, and route evaluation
    import os
    if os.environ.get("OFFLINE_MODE") == "1":
        return "ollama-local"
    
    if strict_latency:
        return "groq-mixtral"
        
    if task_complexity > 8:
        return "claude-3-opus"
    else:
        return "gemini-1.5-flash"
