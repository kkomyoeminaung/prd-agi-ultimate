import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Brain } from 'lucide-react';

export default function ReasoningChain({ steps }: { steps: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-4 bg-black/40 rounded-lg border border-[#30363d] overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 flex items-center justify-between hover:bg-[#161b22] transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-400">
          <Brain className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Chain of Thought</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
      </button>
      
      {isOpen && (
        <div className="p-3 border-t border-[#30363d] bg-[#0d1117]/50">
          <ul className="text-xs font-mono text-teal-500/80 list-disc ml-4 space-y-2">
            {steps.map((s, idx) => (
              <li key={idx} className="leading-relaxed opacity-90">{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
