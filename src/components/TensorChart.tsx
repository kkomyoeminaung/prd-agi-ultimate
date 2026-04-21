import React from 'react';
import { Network } from 'lucide-react';

export default function TensorChart({ tensor }: { tensor: any }) {
  if (!tensor) return null;
  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded p-4 text-xs font-mono text-teal-400">
      <div className="flex items-center gap-2 mb-2 border-b border-[#30363d] pb-2">
        <Network className="w-4 h-4 text-teal-500" />
        <span className="font-bold uppercase tracking-widest text-slate-400">Tensor Metadata</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div><span className="text-slate-500">Causality (C):</span> {tensor.C?.toFixed(2)}</div>
        <div><span className="text-slate-500">Weight (W):</span> {tensor.W?.toFixed(2)}</div>
        <div><span className="text-slate-500">Logic (L):</span> {tensor.L}</div>
        <div><span className="text-slate-500">Time (T):</span> {tensor.T?.toFixed(2)}</div>
        <div><span className="text-slate-500">Uncertainty (U):</span> {tensor.U?.toFixed(2)}</div>
        <div><span className="text-slate-500">Dim (D):</span> {tensor.D}</div>
      </div>
    </div>
  );
}
