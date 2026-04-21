import React, { useEffect, useState } from 'react';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function BuildProgress({ isActive, onComplete }: { isActive: boolean, onComplete: () => void }) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  useEffect(() => {
    if (!isActive) return;
    setStatus('running');
    setLogs(['Connecting to Agent Pipeline...']);

    // Determine WS protocol based on current protocol
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    let ws: WebSocket;
    const connectWs = () => {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.logs) setLogs(data.logs);
            if (data.status === 'completed') {
                setStatus('completed');
                onComplete();
                ws.close();
            }
        };
        ws.onerror = () => {
            setLogs(prev => [...prev, 'WebSocket error, retrying...']);
        };
    };

    connectWs();
    return () => {
       if (ws && ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [isActive]);

  const handleDownload = () => {
    window.location.href = '/api/agents/download';
  };

  if (!isActive && status === 'idle') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }} 
      animate={{ opacity: 1, height: 'auto' }} 
      className="mt-6 bg-[#161b22] border border-[#30363d] rounded-lg p-5"
    >
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[#30363d]">
         <div className="flex items-center gap-3">
             <div className={`p-2 rounded-full ${status === 'running' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-green-500/20 text-green-400'}`}>
                 {status === 'running' ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
             </div>
             <div>
                 <h3 className="text-sm font-bold text-slate-200">Manifold Build Pipeline</h3>
                 <p className="text-xs text-slate-500 uppercase tracking-widest">{status}</p>
             </div>
         </div>
         {status === 'completed' && (
             <button 
                onClick={handleDownload}
                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded text-xs font-bold transition-all shadow-lg shadow-teal-500/20"
             >
                 <Download className="w-4 h-4" />
                 Download ZIP
             </button>
         )}
      </div>
      
      <div className="bg-[#0d1117] rounded p-4 font-mono text-[10px] sm:text-xs text-slate-400 h-48 overflow-y-auto space-y-2 border border-[#30363d]">
          {logs.map((log, i) => (
             <div key={i} className="flex gap-3">
                 <span className="text-slate-600">[{new Date().toISOString().split('T')[1].split('.')[0]}]</span>
                 <span className={log.includes('Failed') ? 'text-red-400' : 'text-indigo-300'}>{log}</span>
             </div>
          ))}
          {status === 'running' && (
             <div className="flex gap-3 text-slate-500 animate-pulse">
                <span>...</span>
             </div>
          )}
      </div>
    </motion.div>
  );
}
