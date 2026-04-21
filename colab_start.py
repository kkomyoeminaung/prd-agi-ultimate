import subprocess
import time
import os
import signal
import sys

def start_process(cmd, name):
    print(f"🚀 Starting {name}...")
    return subprocess.Popen(cmd, shell=True, preexec_fn=os.setsid)

def main():
    # 1. Start Private LLM
    llm_proc = start_process("python3 private-llm/main.py", "Private LLM (8000)")

    # 2. Start PRD Core
    core_proc = start_process("python3 prd-core/main.py", "PRD Core (8001)")
    
    # 3. Start Software Agents
    agents_proc = start_process("python3 software-agents/main.py", "Software Agents (8002)")
    
    # 4. Start Backend
    backend_proc = start_process("cd backend-node && PORT=3001 npm run dev", "Express Backend (3001)")
    
    # 5. Start Frontend
    frontend_proc = start_process("npm run dev", "React Frontend (3000)")
    
    print("📡 All 5 services started. Monitoring...")
    
    try:
        while True:
            time.sleep(5)
            if llm_proc.poll() is not None:
                llm_proc = start_process("python3 private-llm/main.py", "Private LLM (RESTART)")
            if core_proc.poll() is not None:
                core_proc = start_process("python3 prd-core/main.py", "PRD Core (RESTART)")
            if agents_proc.poll() is not None:
                agents_proc = start_process("python3 software-agents/main.py", "Software Agents (RESTART)")
            if backend_proc.poll() is not None:
                backend_proc = start_process("cd backend-node && PORT=3001 npm run dev", "Express Backend (RESTART)")
            if frontend_proc.poll() is not None:
                frontend_proc = start_process("npm run dev", "React Frontend (RESTART)")
    except KeyboardInterrupt:
        print("Stopping processes...")
        os.killpg(os.getpgid(llm_proc.pid), signal.SIGTERM)
        os.killpg(os.getpgid(core_proc.pid), signal.SIGTERM)
        os.killpg(os.getpgid(agents_proc.pid), signal.SIGTERM)
        os.killpg(os.getpgid(backend_proc.pid), signal.SIGTERM)
        try:
            os.killpg(os.getpgid(frontend_proc.pid), signal.SIGTERM)
        except:
            pass
        sys.exit(0)

if __name__ == "__main__":
    main()
