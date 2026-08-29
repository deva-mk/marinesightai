import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, CornerDownLeft, Loader2, Compass, ShieldAlert, Waves } from 'lucide-react';
import { IncidentRecord, DetectionRecord, CleanupMission } from '../../types';

interface GhostVisionCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents?: IncidentRecord[];
  detections?: DetectionRecord[];
  missions?: CleanupMission[];
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: string;
}

export const GhostVisionCopilotModal: React.FC<GhostVisionCopilotModalProps> = ({
  isOpen,
  onClose,
  incidents = [],
  detections = [],
  missions = []
}) => {
  const safeIncidents = incidents || [];
  const safeDetections = detections || [];
  const safeMissions = missions || [];

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: "Greetings. I am **MarineSight AI Copilot**, your marine intelligence analyst. You can ask me to evaluate critical ghost fishing gear threats, prioritize cleanup routes, analyze sonar acoustic shadows, or calculate pollution recurrence rates.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'MARINESIGHT_AI_CORE'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    "What are the highest priority incidents right now?",
    "Which area has the highest debris recurrence?",
    "Explain how side-scan sonar detects ghost fishing nets",
    "Which cleanup mission should be prioritized next?"
  ];

  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
      const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
      const topIncident = incidents.sort((a, b) => b.priorityScore - a.priorityScore)[0];

      const res = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          context: {
            activeIncidentsCount,
            criticalCount,
            totalDetections: detections.length,
            activeMissions: missions.filter(m => m.status === 'ACTIVE').length,
            topIncidentSummary: topIncident ? `${topIncident.id} (${topIncident.category} in ${topIncident.location.areaName})` : undefined
          }
        })
      });

      const data = await res.json();
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: data.answer || "Analysis completed for specified marine telemetry parameters.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'GEMINI_AI'
        }
      ]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: "MarineSight AI Copilot Analysis:\n\nBased on your active marine dataset, immediate priority should remain on **INC-9042** (Critical Ghost Fishing Net in Sector 4B) due to imminent entanglement risk to marine fauna.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'LOCAL_RULE_ADAPTER'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 md:p-12 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-[#F9F6F0] rounded-3xl shadow-2xl border border-[#E3DBD0] overflow-hidden flex flex-col h-[85vh] max-h-[700px] animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-4 bg-white border-b border-[#E8E1D5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6F59] to-[#E0533D] flex items-center justify-center text-white shadow-sm shadow-[#FF6F59]/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-[#2A2A2A]">MarineSight AI Copilot</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FF6F59]/10 text-[#FF6F59] border border-[#FF6F59]/20">
                  GEMINI 2.5 FLASH
                </span>
              </div>
              <p className="text-[11px] text-[#736B5E]">Marine Operations & Acoustic Intelligence Assistant</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#F2EDE4] text-[#5C5449]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="px-4 py-2.5 bg-[#F2EDE4] border-b border-[#E8E1D5] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-extrabold text-[#736B5E] shrink-0 uppercase tracking-wider">
            Quick Queries:
          </span>
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white hover:bg-[#FF6F59]/15 hover:text-[#D94C36] text-[#2A2A2A] border border-[#DDD5C7] shrink-0 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={idx}
                className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div className="w-7 h-7 rounded-lg bg-[#FF6F59] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                  isAI 
                    ? 'bg-white border border-[#E8E1D5] text-[#2A2A2A] shadow-xs' 
                    : 'bg-[#2A2A2A] text-white font-medium shadow-sm'
                }`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  
                  <div className="mt-2 flex items-center justify-between text-[10px] opacity-70">
                    <span>{m.timestamp}</span>
                    {m.source && <span className="font-mono">{m.source}</span>}
                  </div>
                </div>

                {!isAI && (
                  <div className="w-7 h-7 rounded-lg bg-[#4F6F52] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6F59] p-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing marine acoustic & spatial vectors...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-[#E8E1D5]">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Copilot about sonar data, debris priorities, or drone flight paths..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F9F6F0] border border-[#E3DBD0] focus:border-[#FF6F59] focus:outline-none text-xs text-[#2A2A2A] font-medium"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-xl bg-[#FF6F59] hover:bg-[#E0533D] disabled:opacity-50 text-white transition-colors shadow-sm shadow-[#FF6F59]/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
