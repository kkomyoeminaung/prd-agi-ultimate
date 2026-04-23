import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Brain, Zap, History, BookOpen, Settings, 
  MessageSquare, Layout, BarChart, GraduationCap, 
  Upload, Download, FileText, Activity, ShieldCheck,
  FolderOpen, Cpu, Disc
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import TensorChart from './components/TensorChart';
import ReasoningChain from './components/ReasoningChain';
import ToolCallPanel from './components/ToolCallPanel';
import BuildProgress from './components/BuildProgress';

function cn(...inputs: ClassValue[]) {
//...
}

type Tab = 'chat' | 'pipeline' | 'dashboard' | 'curriculum' | 'upload' | 'reasoning' | 'multimodal';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [messages, setMessages] = useState<{sender: string, text: string, steps?: string[], tensor?: any}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [appIdea, setAppIdea] = useState('');
  const [buildActive, setBuildActive] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // ... (keep handleReasoningSend, handleMultimodalUpload)

  const handleReasoningSend = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: 'user', text: input };
    setMessages([...messages, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }
      const data = await res.json();
      setMessages(prev => [...prev, { 
         sender: 'ai', 
         text: data.answer, 
         steps: data.steps, 
         tensor: data.tensor 
      }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { 
        sender: 'system', 
        text: `Error connecting to brain: ${e.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMultimodalUpload = async (e: any) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const fd = new FormData();
     fd.append('file', file);
     setMessages(prev => [...prev, { sender: 'user', text: `[Uploaded File: ${file.name}]` }]);
     setIsLoading(true);
     try {
        const res = await fetch('/api/multimodal/process', { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Analysis failed');
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'ai', text: `Analyzed Media: ${data.caption || data.transcript || data.scenes}`, tensor: data.tensor }]);
     } catch(err: any) {
        setMessages(prev => [...prev, { sender: 'system', text: `File analysis failed: ${err.message}`}]);
     } finally {
       setIsLoading(false);
     }
  };

  const startBuild = async () => {
    if (!appIdea.trim()) return;
    setBuildActive(true);
    try {
      await fetch('/api/agents/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: appIdea })
      });
      // The WebSocket will handle the rest!
    } catch (e) {}
  };

  return (
    <div id="app-root" className="flex h-screen bg-[#0d1117] text-[#c9d1d9] font-sans overflow-hidden selection:bg-teal-500/30">
      {/* Sidebar Navigation */}
      <aside className="w-16 md:w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col shrink-0 transition-all duration-300">
        <div className="p-4 md:p-6 border-b border-[#30363d] flex justify-center md:block">
          <h1 className="text-xl font-bold text-white flex items-center gap-2 overflow-hidden">
            <span className="w-3 h-3 bg-teal-400 rounded-full shadow-[0_0_8px_#2dd4bf] shrink-0"></span>
            <span className="hidden md:inline">PRD-AGI</span> <span className="text-xs font-mono text-teal-500 font-normal hidden md:inline whitespace-nowrap">v3.0</span>
          </h1>
        </div>
        
        <nav className="flex-1 p-2 md:p-4 space-y-1">
          {[
            { id: 'chat', icon: MessageSquare, label: 'General Chat' },
            { id: 'reasoning', icon: Brain, label: 'CoT Reasoning' },
            { id: 'multimodal', icon: FileText, label: 'Multimodal' },
            { id: 'pipeline', icon: Layout, label: 'Dev Pipeline' },
            { id: 'dashboard', icon: BarChart, label: 'Dashboard' },
            { id: 'curriculum', icon: GraduationCap, label: 'Curriculum' },
            { id: 'upload', icon: FolderOpen, label: 'Drive Explorer' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as Tab)}
              title={t.label}
              className={cn(
                "w-full px-2 md:px-4 py-2.5 rounded-md cursor-pointer flex items-center justify-center md:justify-start gap-3 transition-all text-sm font-medium",
                activeTab === t.id 
                  ? "bg-[#21262d] text-white border border-[#30363d] shadow-sm" 
                  : "text-slate-400 hover:bg-[#21262d]/50 hover:text-slate-200"
              )}
            >
              <t.icon className={cn("w-5 h-5 md:w-4 md:h-4 shrink-0", activeTab === t.id ? "text-teal-400" : "opacity-70")} />
              <span className="hidden md:inline truncate">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* System Status in Sidebar */}
        <div className="p-2 md:p-4 border-t border-[#30363d] bg-[#0d1117] hidden md:block">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">System Status</span>
            <span className="px-2 py-0.5 rounded-full bg-green-900/20 text-green-400 text-[9px] border border-green-800/50">ACTIVE</span>
          </div>
          <div className="space-y-2 text-[10px] font-mono text-slate-400">
            <div className="flex justify-between"><span>Colab:</span><span className="text-slate-100">Connected</span></div>
            <div className="flex justify-between"><span>Drive:</span><span className="text-slate-100 truncate w-24 text-right">/agi_data</span></div>
            <div className="flex justify-between text-teal-500/80"><span>GPU:</span><span>T4 Native</span></div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="h-16 border-b border-[#30363d] bg-[#161b22]/50 flex items-center justify-between px-6 shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Core Engine</span>
              <span className="text-xs font-semibold text-teal-400">PRD-LLM Tensor Core (6-Dim)</span>
            </div>
            <div className="h-8 w-px bg-[#30363d]"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Dream Mode</span>
              <span className="text-xs font-semibold text-indigo-400 font-mono">Quota: 42/50</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-1.5 bg-[#21262d] border border-[#30363d] rounded text-xs font-semibold hover:bg-[#30363d] transition-colors">
              Settings
            </button>
            <button className="px-5 py-1.5 bg-indigo-600 text-white rounded text-xs font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition-all">
              Dream Now
            </button>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-hidden p-6 relative">
          <AnimatePresence mode="wait">
            {(activeTab === 'chat' || activeTab === 'reasoning' || activeTab === 'multimodal') && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="flex flex-col h-full max-w-4xl mx-auto"
              >
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-[#30363d]">
                  {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                      <Brain className="w-16 h-16 mb-6 text-teal-400" />
                      <p className="text-xl font-medium tracking-tight">Initiate Sequence: {activeTab.toUpperCase()}</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {m.sender !== 'user' && (
                        <div className="w-8 h-8 rounded bg-teal-600 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-white shadow-[0_0_10px_rgba(20,184,166,0.3)] uppercase">AI</div>
                      )}
                      <div className={cn(
                        "p-3.5 rounded-xl text-sm leading-relaxed max-w-[85%] border shadow-sm",
                        m.sender === 'user' 
                          ? "bg-indigo-900/20 border-indigo-500/30 text-slate-100" 
                          : "bg-[#161b22] border-[#30363d] text-slate-300"
                      )}>
                        {/* CoT Reasoning Display using dedicated component */}
                        {m.steps && m.steps.length > 0 && <ReasoningChain steps={m.steps.filter(s => !s.startsWith('Called'))} />}
                        
                        <p>{m.text}</p>

                        {/* Extract Tool Calls from steps if present */}
                        {m.steps && <ToolCallPanel calls={m.steps.filter(s => s.startsWith('Called'))} />}
                        
                        {/* Tensor Data Display using dedicated component */}
                        {m.tensor && (
                          <div className="mt-4">
                            <TensorChart tensor={m.tensor} />
                          </div>
                        )}
                      </div>
                      {m.sender === 'user' && (
                        <div className="w-8 h-8 rounded bg-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-[10px] text-white uppercase shadow-md">Me</div>
                      )}
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded bg-teal-600 flex-shrink-0 flex items-center justify-center animate-pulse shadow-[0_0_10px_rgba(20,184,166,0.3)] uppercase text-white font-bold text-[10px]">AI</div>
                      <div className="bg-[#161b22] border border-[#30363d] p-3 rounded-xl text-sm italic text-slate-500">Processing manifold...</div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex flex-col gap-2">
                  {activeTab === 'multimodal' && (
                    <div className="mb-2">
                      <input type="file" onChange={handleMultimodalUpload} accept="image/*,audio/*,video/*" className="text-xs text-slate-400 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-teal-500/10 file:text-teal-400 hover:file:bg-teal-500/20" />
                    </div>
                  )}
                  <div className="relative w-full max-w-3xl mx-auto">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleReasoningSend()}
                      placeholder="Enter query or tool code to execute..."
                      className="w-full bg-[#161b22] border border-[#30363d] rounded-full py-3.5 pl-6 pr-24 text-sm focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 transition-all placeholder:text-slate-600"
                    />
                    <button 
                      onClick={handleReasoningSend}
                      className="absolute right-2 top-2 bg-indigo-600 hover:bg-indigo-500 p-2 px-5 rounded-full text-[10px] font-black tracking-widest text-white shadow-lg transition-all"
                    >
                      SEND
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pipeline' && (
              <motion.div key="pipeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex gap-6 max-w-6xl mx-auto">
                <div className="flex-1 space-y-6">
                  <div className="bg-[#161b22] border border-[#30363d] p-8 rounded-[2rem] shadow-xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-3 text-white">
                      <Cpu className="text-teal-400 w-5 h-5" /> Software Dev Pipeline
                    </h2>
                    <textarea 
                      value={appIdea}
                      onChange={e => setAppIdea(e.target.value)}
                      placeholder="Describe the application ecosystem architecture..."
                      className="w-full h-40 bg-[#0d1117] border border-[#30363d] rounded-2xl p-6 text-sm focus:outline-none focus:border-teal-500/40 transition-all placeholder:text-slate-600 font-mono leading-relaxed"
                    />
                    <button 
                      onClick={startBuild}
                      className="mt-6 w-full bg-teal-600 hover:bg-teal-500 py-4 rounded-2xl font-black text-xs tracking-[0.2em] shadow-lg shadow-teal-900/20 transition-all flex items-center justify-center gap-2 text-white"
                    >
                      <Zap className="w-4 h-4 fill-white" /> INITIATE MANIFOLD BUILD
                    </button>
                  </div>
                  
                  <BuildProgress isActive={buildActive} onComplete={() => setBuildActive(false)} />
                  
                </div>

                <div className="w-[320px] shrink-0 border-l border-[#30363d]/50 pl-6 hidden xl:block">
                  <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-6 tracking-widest">Agent Propagation</h3>
                  <div className="space-y-4">
                    {[
                      { icon: '📝', name: 'Product Manager', progress: 100, active: buildActive },
                      { icon: '📐', name: 'Architect', progress: buildActive ? 75 : 0, active: buildActive },
                      { icon: '💻', name: 'Developer', progress: buildActive ? 50 : 0, active: buildActive },
                      { icon: '🧪', name: 'QA Agent', progress: buildActive ? 25 : 0, active: buildActive },
                      { icon: '🚀', name: 'DevOps Agent', progress: buildActive ? 10 : 0, active: buildActive },
                    ].map(agent => (
                      <div key={agent.name} className={cn(
                        "p-4 border rounded-2xl transition-all",
                        agent.active ? "bg-teal-500/5 border-teal-500/30" : "bg-[#161b22] border-[#30363d] opacity-40 grayscale"
                      )}>
                        <div className="flex items-center justify-between mb-3 text-xs font-bold">
                          <span className="flex items-center gap-2"><span>{agent.icon}</span> {agent.name}</span>
                          <span className="font-mono text-teal-400">{agent.progress}%</span>
                        </div>
                        <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 transition-all duration-1000" style={{ width: `${agent.progress}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full max-w-6xl mx-auto space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { label: 'Awareness Density (ρ)', value: '0.842', color: 'text-indigo-400', sub: 'Calculated' },
                     { label: 'Paccaya Curvature (κ)', value: '0.124', color: 'text-teal-400', sub: 'Logical Stability' },
                     { label: 'Neural Resolution', value: '1.3B', color: 'text-slate-100', sub: 'Parameters' },
                     { label: 'Distillation Depth', value: '42%', color: 'text-indigo-400', sub: 'Overall Knowledge' }
                   ].map(stat => (
                    <div key={stat.label} className="bg-[#161b22] border border-[#30363d] p-5 rounded-2xl shadow-sm">
                       <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mb-3">{stat.label}</p>
                       <div className={cn("text-3xl font-black", stat.color)}>{stat.value}</div>
                       <p className="text-[10px] text-slate-600 mt-2 font-mono">[{stat.sub}]</p>
                    </div>
                   ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-[#161b22] border border-[#30363d] p-8 rounded-[2.5rem] relative overflow-hidden group h-[400px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(45,212,191,0.05),transparent_50%)]"></div>
                    <div className="relative z-10 flex flex-col h-full">
                       <h2 className="text-sm font-bold flex items-center gap-2 text-white mb-6 uppercase tracking-widest">
                        <BarChart className="text-teal-400 w-4 h-4" /> Causal Tensor Manifold
                       </h2>
                       <div className="flex-1 flex items-center justify-center">
                          <div className="text-center">
                            <Disc className="w-16 h-16 text-teal-500/20 animate-[spin_10s_linear_infinite] mb-4 mx-auto" />
                            <p className="text-xs font-mono text-slate-600 italic tracking-tight">Causal vectors stabilizing in 6D Hilbert space...</p>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-[2.5rem] flex flex-col">
                    <h3 className="text-xs font-bold uppercase text-slate-500 mb-6 tracking-widest">Teacher Ensemble</h3>
                    <div className="grid grid-cols-1 gap-3 overflow-y-auto pr-2">
                       {[
                         { name: 'Gemini 1.5 PRO', status: 'ONLINE', val: '0.99ms', color: 'text-green-500' },
                         { name: 'Ollama local-r1', status: 'HOT', val: '2.1s', color: 'text-orange-500' },
                         { name: 'Claude 3.5 SNT', status: 'STBY', val: '--', color: 'text-slate-600' },
                         { name: 'OpenAI GPT-4o', status: 'RDY', val: '1.4s', color: 'text-teal-500' }
                       ].map(t => (
                        <div key={t.name} className="flex items-center justify-between p-3.5 bg-[#0d1117] border border-[#30363d] rounded-xl hover:border-slate-700 transition-colors">
                          <span className="text-[10px] font-bold text-slate-400">{t.name}</span>
                          <div className="flex items-center gap-4">
                            <span className={cn("text-[9px] font-mono font-bold", t.color)}>{t.status}</span>
                            <span className="text-[10px] font-mono text-slate-600">{t.val}</span>
                          </div>
                        </div>
                       ))}
                    </div>
                    <div className="mt-auto pt-6">
                       <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-3 tracking-widest">
                         <span>Collective Confidence</span>
                         <span className="text-teal-400">0.92</span>
                       </div>
                       <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                         <div className="h-full bg-teal-500 w-[92%] shadow-[0_0_8px_#2dd4bf]"></div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'curriculum' && (
              <motion.div key="curriculum" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full max-w-6xl mx-auto">
                <div className="mb-10 pt-4">
                  <h2 className="text-3xl font-black tracking-tighter text-white mb-2 italic">UNIVERSAL HIERARCHY</h2>
                  <p className="text-slate-500 text-sm font-mono uppercase tracking-[0.3em]">Knowledge Distillation Streams</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {['PHYSICS', 'BUDDHISM', 'AI CORE', 'MATHS', 'PHILOSOPHY'].map(subject => (
                      <div key={subject} className="bg-[#161b22] border border-[#30363d] p-8 rounded-[2rem] hover:border-teal-500/30 transition-all group cursor-pointer relative overflow-hidden h-64 flex flex-col justify-end">
                        <div className="absolute top-8 left-8 text-slate-700 group-hover:text-teal-500/50 transition-all font-black text-6xl select-none opacity-20">
                          {subject[0]}
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-slate-500 border border-slate-700 px-3 py-1 rounded-full group-hover:border-teal-500/30 group-hover:text-teal-500 transition-all">PHASE 1</span>
                            <GraduationCap className="text-slate-600 group-hover:text-white transition-all w-5 h-5" />
                          </div>
                          <h3 className="font-black text-2xl mb-4 group-hover:text-teal-400 transition-all italic">{subject}</h3>
                          <button className="w-full bg-[#0d1117] border border-[#30363d] py-3.5 rounded-xl text-[10px] font-black tracking-[0.2em] hover:bg-white hover:text-black transition-all group-hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                            BEGIN DISTILLATION
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center p-8">
                <label className="w-full max-w-3xl cursor-pointer group">
                  <div className="bg-[#161b22] border-2 border-dashed border-[#30363d] p-20 rounded-[3rem] flex flex-col items-center gap-8 group-hover:border-teal-500/50 group-hover:bg-teal-500/5 transition-all relative overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(45,212,191,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="p-8 bg-[#0d1117] border border-[#30363d] rounded-[2rem] shadow-inner group-hover:scale-110 transition-transform relative z-10 group-hover:shadow-teal-900/40">
                      <Upload className="w-16 h-16 text-teal-400" />
                    </div>
                    <div className="text-center relative z-10">
                      <h3 className="text-2xl font-black mb-3 tracking-tighter text-white">DRIVE EXPLORER INGESTION</h3>
                      <p className="text-slate-500 text-sm max-w-md mx-auto font-medium leading-relaxed uppercase tracking-widest text-[10px]">Distill PDF, ZIP, or YAML definitions into the multidimensional causal Hive.</p>
                    </div>
                    <input type="file" className="hidden" id="fileIn" onChange={() => {}} />
                    <div className="mt-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-black text-xs tracking-widest group-hover:scale-105 transition-all shadow-xl shadow-indigo-900/30">
                      IDENTIFY TARGET OBJECTIVE
                    </div>
                  </div>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer / Console */}
        <footer className="h-12 bg-[#010409] border-t border-[#30363d] flex items-center px-6 font-mono text-[10px] text-slate-500 gap-6 shrink-0 relative z-20">
          <div className="flex items-center gap-2"><span className="text-green-500 animate-pulse font-black text-[14px]">●</span> SYS_READY</div>
          <div className="flex items-center gap-2"><span className="text-indigo-400 font-black text-[14px]">●</span> DREAM_ACTIVE</div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="flex-1 truncate uppercase tracking-tighter opacity-60">
            [DEBUG] {new Date().toLocaleTimeString()} - TENSOR_MERGE_OK - processing manifold slice at rank-12...
          </div>
          <div className="flex items-center gap-4 text-slate-400/80">
            <div className="flex items-center gap-2"><span>LATENCY</span> <span className="text-teal-400">42ms</span></div>
            <div className="flex items-center gap-2"><span>TEMP</span> <span className="text-orange-400">324.k</span></div>
            <div className="flex items-center gap-2 font-black border-l border-slate-800 pl-4"><span>HIVE_ID</span> <span>0xFF7D2-PRD</span></div>
          </div>
        </footer>
      </main>
    </div>
  );
}
