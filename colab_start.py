import subprocess, time, os, signal, sys

def start_process(cmd, name):
    print(f"🚀 Starting {name}...")
    return subprocess.Popen(cmd, shell=True, preexec_fn=os.setsid)

def main():
    # 1. Private LLM (port 8000)
    llm_proc = start_process("python3 private-llm/main.py", "Private LLM (8000)")
    time.sleep(2)

    # 2. PRD Core (port 8001)
    core_proc = start_process(
        "cd prd-core && python3 -m uvicorn main:app --host 0.0.0.0 --port 8001",
        "PRD Core (8001)"
    )
    time.sleep(2)

    # 3. Software Agents (port 8002)
    agents_proc = start_process(
        "cd software-agents && python3 -m uvicorn main:app --host 0.0.0.0 --port 8002",
        "Software Agents (8002)"
    )
    time.sleep(2)

    # 4. Node Backend (port 3001) — backend-node ONLY
    backend_proc = start_process(
        "cd backend-node && PORT=3001 npx tsx server.ts",
        "Express Backend (3001)"
    )
    time.sleep(3)

    # 5. Frontend (port 3000) — frontend ONLY (not "npm run dev" which starts both)
    frontend_proc = start_process(
        "npx vite --port 3000 --host 0.0.0.0",
        "React Frontend (3000)"
    )

    print("✅ All 5 services started. Monitoring...")

    procs = {
        "Private LLM": (llm_proc, "python3 private-llm/main.py"),
        "PRD Core":     (core_proc, "cd prd-core && python3 -m uvicorn main:app --host 0.0.0.0 --port 8001"),
        "Agents":       (agents_proc, "cd software-agents && python3 -m uvicorn main:app --host 0.0.0.0 --port 8002"),
        "Backend":      (backend_proc, "cd backend-node && PORT=3001 npx tsx server.ts"),
        "Frontend":     (frontend_proc, "npx vite --port 3000 --host 0.0.0.0"),
    }

    try:
        while True:
            time.sleep(5)
            for name, (proc, cmd) in list(procs.items()):
                if proc.poll() is not None:
                    print(f"🔄 Restarting {name}...")
                    procs[name] = (start_process(cmd, name), cmd)
    except KeyboardInterrupt:
        print("Stopping all services...")
        for name, (proc, _) in list(procs.items()):
            try: os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
            except: pass
        sys.exit(0)

if __name__ == "__main__":
    main()
