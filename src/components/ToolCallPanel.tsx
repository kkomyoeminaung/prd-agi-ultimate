import React from 'react';
import { Wrench } from 'lucide-react';

export default function ToolCallPanel({ calls }: { calls: string[] }) {
  if (!calls || calls.length === 0) return null;

  return (
    <div className="mt-4 border-l-2 border-indigo-500 pl-3">
      <div className="flex items-center gap-2 mb-2 text-indigo-400">
        <Wrench className="w-3.5 h-3.5" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Tool Executions</span>
      </div>
      <div className="space-y-1">
        {calls.map((call, idx) => (
          <div key={idx} className="bg-indigo-900/10 border border-indigo-500/20 rounded p-2 text-xs font-mono text-indigo-200">
            {call}
          </div>
        ))}
      </div>
    </div>
  );
}
