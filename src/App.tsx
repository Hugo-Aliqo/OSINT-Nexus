import React, { useState, useEffect, useRef } from 'react';
import { Search, Terminal, ShieldAlert, Globe, MapPin, Smartphone, Mail, Send, Database, Bot, ExternalLink, AlertTriangle, CheckCircle, Linkedin, Twitter, Facebook, Instagram, Github, Youtube, MessageCircle, Play, Loader2 } from 'lucide-react';
import { identifyTargetType, parsePhoneData } from './lib/osintHelpers';
import { scanTarget, askOsintQuestion, OsintReport, ChatMessage, runOsintModule, ModuleResult } from './services/osintAgent';

const getSocialIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('linkedin')) return <Linkedin size={14} />;
  if (p.includes('twitter') || p.includes('x')) return <Twitter size={14} />;
  if (p.includes('facebook')) return <Facebook size={14} />;
  if (p.includes('instagram')) return <Instagram size={14} />;
  if (p.includes('github')) return <Github size={14} />;
  if (p.includes('youtube')) return <Youtube size={14} />;
  if (p.includes('whatsapp') || p.includes('telegram') || p.includes('signal')) return <MessageCircle size={14} />;
  return <CheckCircle size={14} />;
};

const OSINT_MODULES = [
  { id: 'linkedin', name: 'LinkedIn Deep Search', query: 'site:linkedin.com', icon: <Linkedin size={14}/> },
  { id: 'facebook', name: 'Facebook Profiling', query: 'site:facebook.com', icon: <Facebook size={14}/> },
  { id: 'twitter', name: 'Twitter / X Footprint', query: 'site:twitter.com', icon: <Twitter size={14}/> },
  { id: 'documents', name: 'Public Documents (PDF/DOC/XLS)', query: 'filetype:pdf OR filetype:doc OR filetype:xls', icon: <Database size={14}/> },
  { id: 'leaks', name: 'Data Leaks & Breaches (Pastebin/etc)', query: 'pastebin OR leak OR breach OR password', icon: <ShieldAlert size={14}/> },
];

export default function App() {
  const [targetInput, setTargetInput] = useState('');
  const [target, setTarget] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'email' | 'phone' | 'unknown'>('unknown');
  const [phoneData, setPhoneData] = useState<any>(null);
  
  const [report, setReport] = useState<OsintReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'modules'>('overview');
  const [moduleResults, setModuleResults] = useState<Record<string, ModuleResult>>({});
  const [runningModules, setRunningModules] = useState<Record<string, boolean>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatting]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetInput.trim()) return;

    const currentTarget = targetInput.trim();
    setTarget(currentTarget);
    const type = identifyTargetType(currentTarget);
    setTargetType(type);

    if (type === 'phone') {
      setPhoneData(parsePhoneData(currentTarget));
    } else {
      setPhoneData(null);
    }

    setIsScanning(true);
    setScanError(null);
    setReport(null);
    setChatHistory([]); // Reset chat for new target

    try {
      const res = await scanTarget(currentTarget);
      setReport(res);
    } catch (e) {
      setScanError("La requête à l'Agent IA a échoué. Assurez-vous d'avoir configuré une clé API valide.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !target) return;

    const userMessage: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatting(true);

    try {
      const replyText = await askOsintQuestion(target, report, [...chatHistory, userMessage]);
      setChatHistory(prev => [...prev, { role: 'model', text: replyText }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "[ERREUR SYSTÈME] Impossible de joindre l'agent IA." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const executeModule = async (moduleId: string, name: string, query: string) => {
    if (!target) return;
    setRunningModules(prev => ({...prev, [moduleId]: true}));
    try {
        const res = await runOsintModule(target, name, query);
        setModuleResults(prev => ({...prev, [moduleId]: res}));
    } catch(e) {
        setModuleResults(prev => ({...prev, [moduleId]: { title: 'Erreur', description: 'Failed to run module.', findings: [] }}));
    } finally {
        setRunningModules(prev => ({...prev, [moduleId]: false}));
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 text-slate-200 font-sans overflow-hidden flex flex-col">
      {/* Header Section */}
      <header className="h-16 border-b border-slate-800 flex items-center px-4 md:px-6 justify-between bg-slate-900/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(14,165,233,0.4)]">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">AEGIS <span className="text-sky-400">OSINT</span></span>
        </div>
        <div className="flex-1 max-w-xl mx-4 sm:mx-8">
          <form onSubmit={handleScan} className="relative flex">
            <input 
              type="text" 
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              placeholder="Enter Phone Number (+33...) or Email..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-4 pr-24 sm:pr-32 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all placeholder:text-slate-500 text-slate-200 shadow-inner"
            />
            <div className="absolute right-1.5 top-1.5 bottom-1.5 flex gap-2">
              <button 
                type="submit"
                disabled={isScanning || !targetInput}
                className="bg-sky-600 hover:bg-sky-500 text-white px-2 sm:px-3 rounded text-[10px] sm:text-xs font-semibold transition-colors disabled:opacity-50 tracking-wider shadow-sm"
              >
                {isScanning ? 'SCANNING...' : 'SCAN TARGET'}
              </button>
            </div>
          </form>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">Systems Active</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <nav className="hidden lg:flex w-16 xl:w-20 border-r border-slate-800 flex-col items-center py-6 gap-8 bg-slate-900/30">
          <div 
            onClick={() => setActiveTab('overview')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-sm ${activeTab === 'overview' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:bg-slate-800 hover:text-sky-400'}`}
            title="Overview"
          >
            <Globe className="w-5 h-5" />
          </div>
          <div 
            onClick={() => setActiveTab('modules')}
            className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-sm ${activeTab === 'modules' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:bg-slate-800 hover:text-sky-400'}`}
            title="Deep Scan Modules"
          >
            <Search className="w-5 h-5" />
          </div>
          <div className="mt-auto mb-2 opacity-50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold border border-slate-600 shadow-inner">AE</div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left panel / Results */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-hide space-y-6">
            {!target ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-4">
                <Globe className="w-16 h-16 opacity-20" />
                <p className="tracking-widest uppercase text-sm font-semibold">Ready for target input</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-5xl mx-auto pb-10">
                {activeTab === 'overview' ? (
                  <>
                  {/* TARGET OVERVIEW CARD */}
                  <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group shadow-lg">
                    <div className="absolute top-0 left-0 w-1 h-full bg-sky-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        {targetType === 'phone' ? <Smartphone size={14}/> : targetType === 'email' ? <Mail size={14}/> : <Globe size={14}/>}
                        Target Intel
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 text-[10px] font-bold shadow-sm">VERIFIED</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-mono text-white tracking-tight break-all border-b border-slate-800 pb-4 mb-4">{target}</p>
                    
                    {targetType === 'phone' && phoneData && (
                      <div className="space-y-3">
                        <div className="flex justify-between border-b border-slate-800/50 pb-2">
                          <span className="text-sm text-slate-500">Country / Region Code</span>
                          <span className="text-sm font-medium text-slate-200 flex items-center gap-2"><MapPin size={14} className="text-sky-500"/> {phoneData.country || 'Unknown'} (+{phoneData.regionCode})</span>
                        </div>
                        <div className="flex justify-between pb-1">
                          <span className="text-sm text-slate-500">Intl Format</span>
                          <span className="text-sm font-medium text-slate-200">{phoneData.international}</span>
                        </div>
                      </div>
                    )}

                    {report?.geolocation && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-2">
                          <MapPin size={12} className="text-emerald-500" /> AI Geolocation Analysis
                        </h4>
                        <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-mono text-emerald-400 break-words">{report.geolocation.location}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 whitespace-nowrap ml-2">
                              {report.geolocation.confidence} CONFIDENCE
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-light flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">SOURCE:</span> {report.geolocation.source}
                          </div>
                        </div>
                      </div>
                    )}
                  </section>

                  {/* INTEGRATED RECONNAISSANCE ENGINE */}
                  <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-lg">
                     <div className="absolute top-0 right-0 p-4 opacity-5">
                       <Bot size={150} />
                     </div>
                     
                     <div className="flex justify-between items-center mb-6 relative z-10 border-b border-slate-800/80 pb-4">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-sky-400 flex items-center gap-2">
                          <Bot size={16}/> Web Search Recon Report
                       </h3>
                       {report && <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">COMPLETED</span>}
                     </div>
                     
                     {isScanning ? (
                       <div className="flex items-center gap-4 text-sky-400 bg-sky-500/5 p-4 rounded-lg border border-sky-500/10">
                         <div className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
                         <span className="text-sm font-medium">Agent analyzing public sources and datasets...</span>
                       </div>
                     ) : scanError ? (
                       <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg flex gap-3 text-rose-400">
                         <AlertTriangle size={18} className="shrink-0" />
                         <p className="text-sm font-medium">{scanError}</p>
                       </div>
                     ) : report ? (
                       <div className="space-y-6 relative z-10">
                          <div className="bg-sky-500/5 p-4 rounded-lg border border-sky-500/10 shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase text-sky-400 mb-2">Executive Summary</h4>
                            <div className="text-sm text-sky-100/90 leading-relaxed font-light">
                              {report.summary}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3">Social Media Mentions</h4>
                              <ul className="text-xs text-slate-300 space-y-2 font-light">
                                 {report.socialMediaMentions.length > 0 ? report.socialMediaMentions.map((m, i) => {
                                   const IconComponent = getSocialIcon(m.platform);
                                   return (
                                     <li key={i} className="flex gap-2 items-start mb-2 last:mb-0">
                                       <span className="text-sky-400 shrink-0 mt-0.5 opacity-80">
                                         {IconComponent}
                                       </span>
                                       <div className="flex flex-col">
                                         <span className="font-semibold text-sky-200">{m.platform}</span>
                                         <span className="leading-relaxed">{m.text}</span>
                                         {m.url && m.url.trim() !== '' && (
                                           <a href={m.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 text-[10px] flex items-center gap-1 mt-1 font-medium transition-colors w-fit">
                                             <ExternalLink size={10} /> View Source
                                           </a>
                                         )}
                                       </div>
                                     </li>
                                   );
                                 }) : <li className="text-slate-500 italic">No direct mentions found.</li>}
                              </ul>
                            </div>
                            <div className="bg-slate-950/40 p-4 rounded-lg border border-slate-800/80">
                              <h4 className="text-[10px] font-bold uppercase text-slate-500 mb-3">Public Info Surfaces</h4>
                              <ul className="text-xs text-slate-300 space-y-2 font-light">
                                 {report.publicInfoSurfaces.length > 0 ? report.publicInfoSurfaces.map((s, i) => (
                                   <li key={i} className="flex gap-2 items-start"><Globe size={14} className="text-sky-500 shrink-0 mt-0.5" /> <span className="leading-relaxed">{s}</span></li>
                                 )) : <li className="text-slate-500 italic">No public surfaces identified.</li>}
                              </ul>
                            </div>
                          </div>

                          <div className="bg-rose-500/5 p-4 rounded-lg border border-rose-500/10 shadow-sm">
                            <h4 className="text-[10px] font-bold uppercase text-rose-400 mb-2 flex items-center gap-2">
                              <ShieldAlert size={14} /> Risk Assessment
                            </h4>
                            <div className="text-sm text-rose-200/90 leading-relaxed font-light">
                              {report.riskAssessment}
                            </div>
                          </div>

                          <div className="mt-6">
                            <h4 className="text-[10px] font-bold uppercase text-sky-400 mb-3 flex items-center gap-2">
                              <Database size={14} /> Integrated OSINT Modules Executed
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {report.integratedTools?.length > 0 ? (
                                report.integratedTools.map((tool, i) => (
                                  <div key={i} className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-lg flex flex-col gap-1.5">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-slate-200">{tool.toolName}</span>
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">{tool.status}</span>
                                    </div>
                                    <div className="text-[11px] text-slate-400 leading-relaxed">
                                      {tool.findings}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="text-[11px] text-slate-500 italic p-3 bg-slate-950/30 border border-slate-800/50 rounded-lg">
                                  No integrated modules reported data.
                                </div>
                              )}
                            </div>
                          </div>
                       </div>
                     ) : (
                       <div className="text-slate-500 text-sm py-8 italic text-center">Report will populate after intelligence gathering.</div>
                     )}
                  </section>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200 flex items-center gap-2">
                           <Search size={16} className="text-sky-400"/> Deep Scan Modules
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">Execute contextual searches via AI integration without leaving the dashboard.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {OSINT_MODULES.map((mod) => {
                        const isRunning = runningModules[mod.id] || false;
                        const result = moduleResults[mod.id];

                        return (
                          <div key={mod.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4 transition-all">
                            <div className="flex justify-between items-center flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                <span className="p-2 bg-slate-800/80 text-sky-400 rounded-lg shadow-inner">
                                  {mod.icon}
                                </span>
                                <div>
                                  <h4 className="text-sm font-bold text-slate-200">{mod.name}</h4>
                                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{mod.query}</p>
                                </div>
                              </div>
                              <button
                                onClick={() => executeModule(mod.id, mod.name, mod.query)}
                                disabled={isRunning || !target}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-sky-400 text-xs font-bold rounded-lg border border-slate-700 transition-colors shadow-sm"
                              >
                                {isRunning ? (
                                  <><Loader2 size={14} className="animate-spin" /> SCANNING</>
                                ) : (
                                  <><Play size={14} /> EXECUTE</>
                                )}
                              </button>
                            </div>

                            {/* Results Area */}
                            {result && (
                              <div className="mt-2 pt-4 border-t border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-300">
                                <h5 className="text-[11px] font-bold text-sky-400 tracking-widest uppercase mb-1">{result.title}</h5>
                                <p className="text-xs text-slate-400 mb-4 bg-slate-950/40 p-3 rounded-lg border border-slate-800/50">{result.description}</p>
                                
                                {result.findings.length > 0 ? (
                                  <ul className="space-y-3">
                                    {result.findings.map((f, idx) => (
                                      <li key={idx} className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-lg">
                                        <div className="flex justify-between items-start gap-4">
                                          <div className="flex-1">
                                            <span className="text-xs font-bold text-slate-200 block mb-1">{f.title}</span>
                                            <span className="text-[11px] text-slate-400 block leading-relaxed">{f.details}</span>
                                          </div>
                                          {f.sourceUrl && f.sourceUrl !== '' && (
                                            <a href={f.sourceUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-slate-800 hover:bg-sky-500/20 text-slate-400 hover:text-sky-400 rounded transition-colors" title="View Source">
                                              <ExternalLink size={14} />
                                            </a>
                                          )}
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-xs text-slate-500 italic p-3 bg-slate-950/20 rounded-lg border border-slate-800/50">No verifiable data surfaced for this module.</div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel / AI Assistant */}
          <div className="w-full md:w-80 lg:w-96 flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/50 backdrop-blur z-10 shrink-0">
              <div className="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.8)]"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-200">AI Cognitive Assistant</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide text-sm bg-slate-900/30">
              {!target ? (
                 <div className="text-center text-xs text-slate-500 mt-10">
                   Initialize a target scan to activate cognitive assistance.
                 </div>
              ) : chatHistory.length === 0 ? (
                <div className="bg-sky-500/5 p-3 rounded-lg border border-sky-500/10 shadow-sm">
                  <span className="text-sky-400 font-semibold text-[11px] uppercase tracking-wider block mb-1">SYS_ONLINE:</span> 
                  <span className="text-sky-200/80 text-xs leading-relaxed font-light">Conversational engine ready. Ask specific questions about targeting "{target}".</span>
                </div>
              ) : (
                chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg shadow-sm ${msg.role === 'user' 
                      ? 'bg-slate-800 border border-slate-700 text-slate-200' 
                      : 'bg-sky-900/30 text-sky-100 border border-sky-500/20'} 
                    `}>
                      <div className="text-[9px] uppercase font-bold text-slate-500 mb-1 tracking-wider">
                        {msg.role === 'user' ? 'OPERATOR' : 'AEGIS_AI'}
                      </div>
                      <div className="text-xs leading-relaxed break-words whitespace-pre-wrap font-light">{msg.text}</div>
                    </div>
                  </div>
                ))
              )}
              {isChatting && (
                <div className="flex justify-start">
                   <div className="max-w-[85%] p-3 rounded-lg bg-sky-900/30 border border-sky-500/20 flex items-center gap-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse delay-75"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse delay-150"></div>
                   </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/50 shrink-0">
              <form onSubmit={handleSendMessage} className="relative flex items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  disabled={!target || isChatting}
                  placeholder={target ? "Ask AI to correlate..." : "Offline"}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-lg py-2.5 pl-3 pr-10 text-xs focus:ring-1 focus:ring-sky-500 outline-none text-slate-200 placeholder:text-slate-500 transition-all disabled:opacity-50 shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={!chatInput.trim() || !target || isChatting}
                  className="absolute right-2 text-sky-500 hover:text-sky-400 disabled:opacity-50 p-1 transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>

          </div>

        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-slate-950 border-t border-slate-800 flex items-center px-4 justify-between text-[10px] text-slate-500 font-mono shrink-0">
        <div className="flex gap-4">
          <span>SESSION_ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
          <span>LATENCY: 42ms</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-500/80 uppercase font-semibold tracking-wider">AES-256 Encrypted</span>
        </div>
      </footer>
    </div>
  );
}
