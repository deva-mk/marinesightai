import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Sparkles, X, Send, Bot, User, Loader2, Compass, ShieldAlert, 
  Waves, BookOpen, CheckCircle2, ExternalLink, Cpu, HelpCircle, 
  Layers, Search, FileText, PlusCircle, Trash2, Filter, ArrowRight, 
  ChevronDown, ChevronUp, Hash, Zap, BookMarked, Clock, Sliders, 
  Eye, RefreshCw, AlertCircle, Check, Anchor, Radio, Info,
  Mic, MicOff, Volume2, VolumeX, MapPin, Globe
} from 'lucide-react';
import { IncidentRecord, DetectionRecord, CleanupMission } from '../../types';
import { 
  RAGDocument, 
  RAGSearchResult, 
  RAG_KNOWLEDGE_BASE, 
  searchRAGKnowledge, 
  generateGroundedRAGAnswer,
  getUserRAGDocs,
  saveUserRAGDoc,
  deleteUserRAGDoc
} from '../../services/ragKnowledge';
import { LiveVoiceClient } from '../../services/liveVoiceClient';
import { apiService } from '../../services/apiService';

interface GroundingLink {
  title: string;
  uri: string;
}

interface Citation {
  id: string;
  title: string;
  category: string;
  score?: number;
  matchedSnippets?: string[];
  summary?: string;
  content?: string;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  source?: string;
  modelUsed?: string;
  ragGrounded?: boolean;
  citations?: Citation[];
  retrievedDocsCount?: number;
  searchLinks?: GroundingLink[];
  mapLinks?: GroundingLink[];
}

export interface GhostVisionCopilotModalProps {
  isOpen: boolean;
  onClose: () => void;
  incidents?: IncidentRecord[];
  detections?: DetectionRecord[];
  missions?: CleanupMission[];
  initialTab?: 'chat' | 'voice' | 'maps' | 'search' | 'userDocs' | 'usageGuides';
}

export const COPILOT_ROLES = [
  {
    id: 'commander',
    name: 'Marine Salvage Lead',
    description: 'Expert on ghost net recovery, dive safety protocols, and subsea lifting bags',
    systemInstruction: 'You are MarineSight AI Marine Salvage Lead. You provide decisive, highly technical operational guidance on ghost net retrieval, ROV manipulator maneuvering, pneumatic lift calculations, and dive safety in the Gulf of Mannar.'
  },
  {
    id: 'physicist',
    name: 'Sonar Hydrographic Physicist',
    description: 'Specialist in 455/900 kHz acoustic shadows, layback calculations, and bathymetry',
    systemInstruction: 'You are MarineSight AI Sonar Hydrographic Physicist. You specialize in side-scan sonar acoustics, acoustic shadow trigonometry (H = L * A / R), slant-range correction, towfish geometry, and underwater acoustic propagation.'
  },
  {
    id: 'ecologist',
    name: 'Gulf of Mannar Ecologist',
    description: 'Specialist in coral reef health, Dugong dugon habitats, and marine biosphere laws',
    systemInstruction: 'You are MarineSight AI Marine Ecologist for the Gulf of Mannar Biosphere Reserve and Palk Bay. You provide authoritative insight on coral reef preservation, dugong and sea turtle protection, microplastic biodegradation, and environmental regulations.'
  },
  {
    id: 'dispatcher',
    name: 'Fleet Drone Dispatcher',
    description: 'Coordinates autonomous surface vessels (ASVs), aerial UAVs, and underwater AUVs',
    systemInstruction: 'You are MarineSight AI Fleet Dispatcher. You optimize autonomous survey tracklines, lawn-mower survey patterns, battery endurance management, and multi-asset coordinate dispatch.'
  }
];

export const GEMINI_MODELS = [
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', badge: 'Recommended', desc: 'Fast, multimodal, supports Search & Maps grounding' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro Preview', badge: 'Deep Reasoning', desc: 'Best for complex calculations and multi-step salvage strategy' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', badge: 'Ultra Fast', desc: 'Lowest latency for rapid situational Q&A' }
];

export const GhostVisionCopilotModal: React.FC<GhostVisionCopilotModalProps> = ({
  isOpen,
  onClose,
  incidents = [],
  detections = [],
  missions = [],
  initialTab = 'chat'
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'voice' | 'maps' | 'search' | 'userDocs' | 'usageGuides'>(initialTab);
  
  // Gemini AI Chatbot Config state
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [selectedRole, setSelectedRole] = useState<string>('commander');
  const [groundingMode, setGroundingMode] = useState<'none' | 'search' | 'maps'>('none');

  // Chat state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedCitationMessageId, setExpandedCitationMessageId] = useState<string | null>(null);

  // Live Voice State (gemini-3.1-flash-live-preview via WebSocket)
  const [voiceStatus, setVoiceStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'speaking' | 'listening'>('disconnected');
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceLog, setVoiceLog] = useState<Array<{ sender: 'user' | 'model'; text: string; time: string }>>([
    { sender: 'model', text: 'Live Voice channel standby. Press "Activate Live Voice" to begin real-time audio conversation with gemini-3.1-flash-live-preview.', time: 'Ready' }
  ]);
  const voiceClientRef = useRef<LiveVoiceClient | null>(null);

  // Google Maps Grounding Explorer State
  const [mapsSearchQuery, setMapsSearchQuery] = useState<string>('Mandapam Marine Research Station & Rameswaram Coast Guard Base');
  const [mapsLoading, setMapsLoading] = useState<boolean>(false);
  const [mapsResponseText, setMapsResponseText] = useState<string>('');
  const [mapsLinks, setMapsLinks] = useState<GroundingLink[]>([]);
  
  // Search & Knowledge Base state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchResults, setSearchResults] = useState<RAGSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDocForModal, setSelectedDocForModal] = useState<RAGDocument | null>(null);

  // User-provided documents state
  const [userDocs, setUserDocs] = useState<RAGDocument[]>(() => getUserRAGDocs());
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocCategory, setNewDocCategory] = useState<RAGDocument['category']>('USER_NOTES');
  const [newDocTags, setNewDocTags] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  const [userDocSuccessMsg, setUserDocSuccessMsg] = useState('');

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: `### MarineSight AI Copilot // Real-Time Intelligence & RAG
Welcome to the unified marine operational copilot. I am directly connected to the **Gemini 3.5 & 3.1 Neural Suite** with live grounding and the **MarineSight RAG Knowledge Engine**:
- **Multi-Turn Chatbot**: Choose between \`gemini-3.5-flash\`, \`gemini-3.1-pro-preview\`, or \`gemini-3.1-flash-lite\`.
- **Google Search Grounding**: Real-time web retrieval for live maritime news, ocean weather, and regulations.
- **Google Maps Grounding**: Grounded geographic location discovery around the Gulf of Mannar & Palk Bay.
- **Real-Time Voice Conversations**: Bidirectional live speech using \`gemini-3.1-flash-live-preview\` via WebSockets.
- **Side-Scan Sonar Physics & Marine SOPs**: Acoustic shadow trigonometry, layback unrolling, and ghost net retrieval protocols.

Select your preferred model or grounding mode above, ask any question below, or switch to the Live Voice tab for hands-free operational dispatch.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'GEMINI 3.5 FLASH + RAG GROUNDED',
      modelUsed: 'gemini-3.5-flash',
      ragGrounded: true,
      retrievedDocsCount: RAG_KNOWLEDGE_BASE.length,
      citations: [
        { id: 'DOC-SONAR-01', title: 'Side-Scan Sonar Acoustic Shadow Trigonometry', category: 'SONAR_ACOUSTICS', score: 0.99 },
        { id: 'DOC-OPS-01', title: 'SOP: Subsea Ghost Net Salvage & Hydraulic Shearing', category: 'OPERATIONS_SALVAGE', score: 0.95 },
        { id: 'DOC-SYS-01', title: 'System Usage: Sonar Studio Ingestion & Triangulation', category: 'SYSTEM_USAGE', score: 0.92 }
      ]
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clean up Live Voice on unmount
  useEffect(() => {
    return () => {
      if (voiceClientRef.current) {
        voiceClientRef.current.disconnect();
        voiceClientRef.current = null;
      }
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, activeTab]);

  // Sync user documents from storage
  const refreshUserDocs = () => {
    const docs = getUserRAGDocs();
    setUserDocs(docs);
  };

  // Perform search whenever search query or category filter changes
  useEffect(() => {
    if (activeTab === 'search') {
      setIsSearching(true);
      const timer = setTimeout(() => {
        try {
          const results = searchRAGKnowledge(searchQuery, selectedCategory, 8, userDocs);
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setIsSearching(false);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, selectedCategory, userDocs, activeTab]);

  // Handle Live Voice Toggle
  const handleToggleLiveVoice = async () => {
    if (isMicActive) {
      voiceClientRef.current?.stopMicrophone();
      setIsMicActive(false);
      setVoiceLog(prev => [...prev, { sender: 'model', text: 'Microphone paused. Voice session maintained in standby.', time: new Date().toLocaleTimeString() }]);
    } else {
      setVoiceError(null);
      if (!voiceClientRef.current) {
        voiceClientRef.current = new LiveVoiceClient({
          onStatusChange: (status) => {
            setVoiceStatus(status);
          },
          onError: (err) => {
            setVoiceError(err);
            setVoiceStatus('disconnected');
            setIsMicActive(false);
          },
          onInterrupted: () => {
            setVoiceLog(prev => [...prev, { sender: 'user', text: '[User interrupted model audio]', time: new Date().toLocaleTimeString() }]);
          },
          onTurnComplete: () => {
            setVoiceLog(prev => [...prev, { sender: 'model', text: '[Live audio response turn complete]', time: new Date().toLocaleTimeString() }]);
          }
        });
      }

      try {
        await voiceClientRef.current.connect();
        await voiceClientRef.current.startMicrophone();
        setIsMicActive(true);
        setVoiceLog(prev => [...prev, { sender: 'model', text: 'Live microphone streaming active. Speak into your microphone to talk to Gemini Live.', time: new Date().toLocaleTimeString() }]);
      } catch (err: any) {
        setVoiceError(err?.message || 'Could not start microphone');
        setIsMicActive(false);
      }
    }
  };

  // Handle Google Maps Grounding Query
  const handleQueryMaps = async (overrideQuery?: string) => {
    const queryToUse = overrideQuery || mapsSearchQuery;
    if (!queryToUse.trim() || mapsLoading) return;

    setMapsLoading(true);
    setMapsResponseText('');
    setMapsLinks([]);

    try {
      const res = await apiService.queryMapsGrounding(queryToUse, 9.2550, 79.2350);
      setMapsResponseText(res.text || 'Location inquiry complete.');
      setMapsLinks(res.mapLinks || []);
    } catch (err: any) {
      setMapsResponseText('Failed to query Google Maps Grounding: ' + (err?.message || 'Network error'));
    } finally {
      setMapsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Pre-configured quick prompt pills grouped by topic
  const quickPrompts = [
    { label: 'Debris Height Formula', query: 'Calculate debris height when shadow length is 6.8m, altitude is 8.5m, and slant range is 22.4m' },
    { label: 'SOP: Ghost Net Removal', query: 'What is the step-by-step procedure for subsea ghost net salvage using hydraulic shears?' },
    { label: 'How to Use Sonar Studio', query: 'How do I upload sonar recordings and switch between 455 kHz and 900 kHz in Sonar Studio?' },
    { label: 'Incident Risk Formula (0-100)', query: 'How does the 4-factor incident priority score formula calculate hazard severity?' },
    { label: 'AUV Lawn-Mower Survey', query: 'What are the swath width and trackline spacing parameters for AUV lawn-mower surveys?' },
    { label: 'Submerged Chemical Drums', query: 'What is the emergency containment protocol for corroded subsea chemical drums?' }
  ];

  // Send message to Copilot with multi-turn history and optional Google Grounding
  const handleSend = async (promptText?: string) => {
    const textToSend = promptText || input;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    if (!promptText) setInput('');
    setLoading(true);

    const activeIncidentsCount = incidents.filter(i => i.status !== 'RESOLVED').length;
    const criticalCount = incidents.filter(i => i.severity === 'CRITICAL').length;
    const topIncident = incidents.slice().sort((a, b) => b.priorityScore - a.priorityScore)[0];
    const runtimeContext = {
      activeIncidentsCount,
      criticalCount,
      totalDetections: detections.length,
      activeMissions: missions.filter(m => m.status === 'ACTIVE').length,
      topIncidentSummary: topIncident ? `${topIncident.id} (${topIncident.category} in ${topIncident.location.areaName}, Score: ${topIncident.priorityScore})` : undefined
    };

    try {
      const activeRole = COPILOT_ROLES.find(r => r.id === selectedRole) || COPILOT_ROLES[0];

      // Call unified /api/chat endpoint with multi-turn conversation history
      const res = await apiService.chatWithGemini({
        messages: updatedHistory.map(m => ({
          role: m.sender === 'ai' ? 'assistant' : 'user',
          content: m.text
        })),
        prompt: textToSend,
        model: selectedModel,
        grounding: groundingMode,
        systemInstruction: activeRole.systemInstruction,
        location: { latitude: 9.2550, longitude: 79.2350 },
        context: runtimeContext
      });

      const retrievedDocs = res.rag?.retrievedDocs || [];
      const searchLinks = res.grounding?.searchLinks || [];
      const mapLinks = res.grounding?.mapLinks || [];

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.reply || res.text || "Operational analysis complete.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: res.source || `${selectedModel.toUpperCase()} ${groundingMode !== 'none' ? `+ ${groundingMode.toUpperCase()} GROUNDING` : '+ RAG'}`,
          modelUsed: res.modelUsed || selectedModel,
          ragGrounded: true,
          retrievedDocsCount: retrievedDocs.length,
          searchLinks,
          mapLinks,
          citations: retrievedDocs.map((d: any) => ({
            id: d.id,
            title: d.title,
            category: d.category,
            score: d.score,
            summary: d.summary,
            content: d.content,
            matchedSnippets: d.matchedSnippets
          }))
        }
      ]);
    } catch (e: any) {
      console.warn('Chat API error, using local RAG fallback:', e);
      const localResults = searchRAGKnowledge(textToSend, 'ALL', 4, userDocs);
      const groundedAnswer = generateGroundedRAGAnswer(textToSend, localResults, runtimeContext);

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: groundedAnswer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'LOCAL_RAG_SYNTHESIZER',
          ragGrounded: true,
          retrievedDocsCount: localResults.length,
          citations: localResults.map(r => ({
            id: r.doc.id,
            title: r.doc.title,
            category: r.doc.category,
            score: r.score,
            summary: r.doc.summary,
            content: r.doc.content,
            matchedSnippets: r.matchedSnippets
          }))
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Add a user-provided note/document to the RAG knowledge corpus
  const handleAddUserDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocTitle.trim() || !newDocContent.trim()) return;

    const tagsArray = newDocTags
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const created = saveUserRAGDoc({
      title: newDocTitle.trim(),
      category: newDocCategory,
      tags: tagsArray.length > 0 ? tagsArray : ['user-note', 'field-observation'],
      summary: newDocContent.trim().slice(0, 160) + '...',
      content: newDocContent.trim(),
      citations: ['User Field Observation / Maritime Logbook'],
      sampleQuestions: [
        `What does the field note "${newDocTitle.trim()}" specify?`,
        `How does ${newDocTitle.trim()} apply to current operations?`
      ]
    });

    refreshUserDocs();
    setNewDocTitle('');
    setNewDocTags('');
    setNewDocContent('');
    setUserDocSuccessMsg(`Document "${created.title}" successfully indexed into active RAG corpus!`);
    setTimeout(() => setUserDocSuccessMsg(''), 4000);
  };

  // Delete a user document
  const handleDeleteUserDoc = (id: string) => {
    deleteUserRAGDoc(id);
    refreshUserDocs();
  };

  // Total active corpus count
  const totalCorpusCount = RAG_KNOWLEDGE_BASE.length + userDocs.length;

  return (
    <div id="ghostvision-copilot-container" className="fixed inset-0 z-50 overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center animate-in fade-in duration-150">
      
      {/* Backdrop */}
      <div 
        id="ghostvision-backdrop"
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      <div id="ghostvision-modal-card" className="relative w-full max-w-5xl bg-[#090E17] rounded-2xl shadow-2xl border border-teal-500/30 overflow-hidden flex flex-col h-[90vh] max-h-[820px] text-white">
        
        {/* Top Header */}
        <div id="copilot-header" className="p-4 bg-[#0B1322] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-[#0D9488] flex items-center justify-center text-black font-black shadow-lg shadow-[#2DD4BF]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  MarineSight AI Copilot
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23] text-black tracking-wider">
                  RAG GROUNDED
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-teal-950 text-teal-300 border border-teal-500/30">
                  <Cpu className="w-3 h-3" /> GEMINI FLASH + BM25
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans flex items-center gap-2">
                <span>Real-Time Technical Retrieval & Marine Intelligence</span>
                <span className="inline-block w-1 h-1 rounded-full bg-teal-400"></span>
                <span className="text-teal-300 font-mono text-[11px]">{totalCorpusCount} Indexed Docs ({userDocs.length} User Notes)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copilot-close-btn"
              onClick={onClose} 
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-stone-400 hover:text-white transition-colors"
              title="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Navigation Tabs */}
        <div id="copilot-tab-bar" className="px-4 bg-[#070B13] border-b border-white/10 flex items-center justify-between overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 py-2">
            <button
              id="tab-btn-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'chat'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Copilot Chat & Q&A</span>
            </button>

            <button
              id="tab-btn-voice"
              onClick={() => setActiveTab('voice')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'voice'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Radio className={`w-4 h-4 ${isMicActive ? 'text-rose-400 animate-pulse' : ''}`} />
              <span>Live Voice Channel</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-500/30">
                LIVE API
              </span>
            </button>

            <button
              id="tab-btn-maps"
              onClick={() => setActiveTab('maps')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'maps'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Maps Grounding</span>
            </button>

            <button
              id="tab-btn-search"
              onClick={() => setActiveTab('search')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'search'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Docs Explorer</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-black/30 text-white">
                {totalCorpusCount}
              </span>
            </button>

            <button
              id="tab-btn-userdocs"
              onClick={() => setActiveTab('userDocs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'userDocs'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>User Notes</span>
              {userDocs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#FFFF23] text-black font-bold">
                  {userDocs.length}
                </span>
              )}
            </button>

            <button
              id="tab-btn-guides"
              onClick={() => setActiveTab('usageGuides')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans flex items-center gap-2 transition-all ${
                activeTab === 'usageGuides'
                  ? 'bg-[#2DD4BF] text-black font-bold shadow-md shadow-[#2DD4BF]/20'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-white/5'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Usage Guides</span>
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-stone-400">
            <span className="flex items-center gap-1 text-teal-400">
              <Zap className="w-3.5 h-3.5 text-[#FFFF23]" /> Gemini 3.5 & 3.1 Suite
            </span>
          </div>
        </div>

        {/* TAB 1: CHAT & TECHNICAL Q&A */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080C15]">
            
            {/* Model & Grounding Config Bar */}
            <div id="model-config-toolbar" className="px-4 py-2 bg-[#09111E] border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Model Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Model:</span>
                  <select
                    id="copilot-model-select"
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="bg-[#121B2B] text-teal-300 font-mono text-xs border border-white/15 rounded-md px-2 py-1 focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    {GEMINI_MODELS.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.badge})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Persona Selector */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Role:</span>
                  <select
                    id="copilot-role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-[#121B2B] text-stone-200 font-mono text-xs border border-white/15 rounded-md px-2 py-1 focus:outline-none focus:border-teal-400 cursor-pointer"
                  >
                    {COPILOT_ROLES.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Grounding Mode Toggle */}
                <div className="flex items-center gap-1 text-xs pl-1">
                  <span className="text-[10px] font-mono text-stone-400 uppercase">Grounding:</span>
                  <div className="inline-flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setGroundingMode('none')}
                      className={`px-2 py-0.5 rounded ${groundingMode === 'none' ? 'bg-teal-500 text-black font-bold' : 'text-stone-400 hover:text-white'}`}
                    >
                      RAG Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroundingMode('search')}
                      className={`px-2 py-0.5 rounded flex items-center gap-1 ${groundingMode === 'search' ? 'bg-teal-500 text-black font-bold' : 'text-stone-400 hover:text-white'}`}
                    >
                      <Globe className="w-3 h-3" /> Search
                    </button>
                    <button
                      type="button"
                      onClick={() => setGroundingMode('maps')}
                      className={`px-2 py-0.5 rounded flex items-center gap-1 ${groundingMode === 'maps' ? 'bg-teal-500 text-black font-bold' : 'text-stone-400 hover:text-white'}`}
                    >
                      <MapPin className="w-3 h-3" /> Maps
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-stone-400 hidden lg:block">
                Gulf of Mannar (9.2550°N, 79.2350°E)
              </div>
            </div>

            {/* Quick Query Suggestions Bar */}
            <div id="quick-prompts-bar" className="px-4 py-2 bg-[#0C121D] border-b border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              <span className="text-[11px] font-mono font-bold text-[#2DD4BF] shrink-0 uppercase tracking-wider flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Technical Queries:
              </span>
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.query)}
                  className="text-xs font-mono px-3 py-1 rounded-lg bg-white/5 hover:bg-[#2DD4BF]/20 hover:text-[#2DD4BF] text-stone-300 border border-white/10 shrink-0 transition-colors"
                  title={qp.query}
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Messages Feed */}
            <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m) => {
                const isAI = m.sender === 'ai';
                const isExpanded = expandedCitationMessageId === m.id;

                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAI && (
                      <div className="w-8 h-8 rounded-xl bg-[#2DD4BF] text-black flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAI 
                        ? 'bg-[#101726] border border-white/10 text-stone-200 shadow-lg' 
                        : 'bg-[#FFFF23] text-black font-semibold shadow-md'
                    }`}>
                      <div className="whitespace-pre-wrap font-sans text-xs sm:text-[13px] leading-relaxed">
                        {m.text}
                      </div>

                      {/* Google Search Grounding Links */}
                      {isAI && m.searchLinks && m.searchLinks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-[11px] font-mono font-bold text-sky-400 flex items-center gap-1.5 mb-1.5">
                            <Globe className="w-3.5 h-3.5" />
                            GOOGLE SEARCH GROUNDING SOURCES ({m.searchLinks.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.searchLinks.map((link, lIdx) => (
                              <a
                                key={lIdx}
                                href={link.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-md bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/30 text-[11px] font-mono text-sky-300 flex items-center gap-1.5 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-sky-400" />
                                <span className="font-medium truncate max-w-[220px]">{link.title || link.uri}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Google Maps Grounding Links */}
                      {isAI && m.mapLinks && m.mapLinks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            GOOGLE MAPS GROUNDED PLACES ({m.mapLinks.length})
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {m.mapLinks.map((link, lIdx) => (
                              <a
                                key={lIdx}
                                href={link.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/30 text-[11px] font-mono text-emerald-300 flex items-center gap-1.5 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
                                <span className="font-medium truncate max-w-[220px]">{link.title || 'View Place on Google Maps'}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* RAG Citations & Grounding Sources Section */}
                      {isAI && m.citations && m.citations.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-mono font-bold text-[#2DD4BF] flex items-center gap-1.5">
                              <BookMarked className="w-3.5 h-3.5" />
                              RETRIEVED RAG SOURCES ({m.citations.length})
                            </span>
                            <button
                              onClick={() => setExpandedCitationMessageId(isExpanded ? null : m.id)}
                              className="text-[11px] font-mono text-stone-400 hover:text-stone-200 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isExpanded ? 'Hide Passages' : 'Inspect Passages'}</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => {
                                  const fullDoc = RAG_KNOWLEDGE_BASE.find(d => d.id === c.id) || 
                                                  userDocs.find(d => d.id === c.id) || {
                                                    id: c.id,
                                                    title: c.title,
                                                    category: c.category as any,
                                                    tags: ['retrieved-source'],
                                                    summary: c.summary || c.title,
                                                    content: c.content || c.summary || 'Full text indexed in RAG knowledge base.',
                                                    citations: ['MarineSight Directorate'],
                                                    sampleQuestions: []
                                                  };
                                  setSelectedDocForModal(fullDoc as RAGDocument);
                                }}
                                className="px-2.5 py-1 rounded-md bg-black/50 hover:bg-teal-950/80 border border-teal-500/30 text-[11px] font-mono text-teal-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                                title="Click to view full technical document"
                              >
                                <CheckCircle2 className="w-3 h-3 text-[#2DD4BF]" />
                                <span className="font-semibold truncate max-w-[200px]">{c.title}</span>
                                {c.score !== undefined && (
                                  <span className="text-[#FFFF23] font-bold">
                                    {Math.round(c.score * 100)}%
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>

                          {/* Expanded Passages Drawer */}
                          {isExpanded && (
                            <div className="mt-2.5 space-y-2 bg-black/40 p-3 rounded-xl border border-white/10">
                              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1">
                                Exact Grounded Passages:
                              </span>
                              {m.citations.map((c, cIdx) => (
                                <div key={cIdx} className="text-[11px] font-mono bg-white/5 p-2 rounded-lg border border-white/5">
                                  <div className="flex items-center justify-between text-teal-300 font-bold mb-1">
                                    <span>[{c.id}] {c.title}</span>
                                    <span className="text-[10px] text-stone-400">{c.category}</span>
                                  </div>
                                  {c.matchedSnippets && c.matchedSnippets.length > 0 ? (
                                    c.matchedSnippets.map((snip, sIdx) => (
                                      <p key={sIdx} className="text-stone-300 italic pl-2 border-l-2 border-teal-500/40 my-1">
                                        "{snip}"
                                      </p>
                                    ))
                                  ) : (
                                    <p className="text-stone-400">{c.summary}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Footer telemetry timestamp */}
                      <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono opacity-75">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {m.timestamp}
                        </span>
                        {m.source && (
                          <span className="text-[#2DD4BF] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#FFFF23]" /> {m.source}
                          </span>
                        )}
                      </div>
                    </div>

                    {!isAI && (
                      <div className="w-8 h-8 rounded-xl bg-[#1E293B] border border-white/15 text-white flex items-center justify-center shrink-0 mt-1 shadow-md">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-center gap-3 text-xs font-mono text-[#2DD4BF] p-3.5 bg-[#101726]/80 rounded-2xl border border-teal-500/30 w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFFF23]" />
                  <span>Consulting {selectedModel} with operational context...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Form */}
            <div id="chat-input-bar" className="p-3.5 bg-[#0A101C] border-t border-white/10">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <input
                    id="copilot-text-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about side-scan sonar, salvage protocols, system usage, or custom notes..."
                    className="w-full px-4 py-3 rounded-xl bg-[#060910] border border-white/15 focus:border-[#2DD4BF] focus:outline-none text-xs text-white placeholder:text-stone-500 font-sans shadow-inner"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-stone-500 hidden sm:inline">
                    Enter to query
                  </span>
                </div>
                <button
                  id="copilot-submit-btn"
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-5 py-3 rounded-xl bg-[#2DD4BF] hover:bg-[#26b4a2] disabled:opacity-40 text-black font-extrabold text-xs transition-colors shadow-lg shadow-[#2DD4BF]/20 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <span>Query AI</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE VOICE CONVERSATIONS (gemini-3.1-flash-live-preview) */}
        {activeTab === 'voice' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080C15] p-6 overflow-y-auto">
            <div className="max-w-2xl mx-auto w-full space-y-6">
              
              {/* Header card */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-500/20">
                  <Radio className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Live Operational Voice Dispatcher</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/30">
                      gemini-3.1-flash-live-preview
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Direct low-latency bidirectional voice communication over WebSockets. Speak directly into your microphone for real-time salvage coordination, sonar acoustic calculations, and incident triage in the Gulf of Mannar.
                  </p>
                </div>
              </div>

              {/* Live Audio Visualizer Stage */}
              <div className="p-8 rounded-2xl bg-[#090D16] border border-teal-500/30 flex flex-col items-center justify-center text-center space-y-6">
                
                {/* Voice Status Pill */}
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    voiceStatus === 'speaking' ? 'bg-amber-400 animate-ping' :
                    voiceStatus === 'listening' ? 'bg-rose-500 animate-pulse' :
                    voiceStatus === 'connected' ? 'bg-teal-400' :
                    voiceStatus === 'connecting' ? 'bg-yellow-400 animate-spin' :
                    'bg-stone-500'
                  }`} />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-teal-300">
                    STATUS: {voiceStatus.toUpperCase()}
                  </span>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-xs">
                  {[40, 75, 25, 90, 50, 80, 30, 65, 95, 45, 70, 35].map((h, i) => (
                    <div
                      key={i}
                      className={`w-2 rounded-full transition-all duration-150 ${
                        isMicActive || voiceStatus === 'speaking'
                          ? 'bg-gradient-to-t from-teal-400 to-rose-400 animate-pulse'
                          : 'bg-stone-800'
                      }`}
                      style={{
                        height: isMicActive || voiceStatus === 'speaking'
                          ? `${Math.max(15, (h * (voiceStatus === 'speaking' ? 1.0 : 0.6)))}%`
                          : '15%'
                      }}
                    />
                  ))}
                </div>

                {/* Voice Action Button */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    id="live-voice-toggle-btn"
                    onClick={handleToggleLiveVoice}
                    className={`px-8 py-4 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all shadow-xl cursor-pointer ${
                      isMicActive
                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                        : 'bg-[#2DD4BF] hover:bg-[#25b5a3] text-black shadow-[#2DD4BF]/25'
                    }`}
                  >
                    {isMicActive ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        <span>Mute / Disconnect Microphone</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        <span>Activate Live Voice Channel</span>
                      </>
                    )}
                  </button>

                  <span className="text-[11px] font-mono text-stone-400">
                    {isMicActive ? 'Transmitting 16 kHz PCM audio bidirectional stream' : 'Microphone currently idle. Click to start.'}
                  </span>
                </div>

                {voiceError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono">
                    {voiceError}
                  </div>
                )}
              </div>

              {/* Voice Channel Event Transcript */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-stone-400">
                  <span>SESSION LOG & DISPATCH TRANSCRIPT</span>
                  <span>Audio Out: 24 kHz PCM</span>
                </div>
                <div className="p-4 rounded-xl bg-[#090E17] border border-white/10 space-y-2 max-h-48 overflow-y-auto">
                  {voiceLog.map((log, lIdx) => (
                    <div key={lIdx} className="text-xs font-mono flex items-start gap-2">
                      <span className="text-stone-500 text-[10px] shrink-0 mt-0.5">[{log.time}]</span>
                      <span className={log.sender === 'user' ? 'text-amber-300 font-semibold' : 'text-teal-300'}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: GOOGLE MAPS GROUNDING EXPLORER */}
        {activeTab === 'maps' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080C15] p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full space-y-6">
              
              {/* Header card */}
              <div className="p-5 rounded-2xl bg-[#0F172A] border border-white/10 flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Google Maps Grounding Engine</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      gemini-3.5-flash + googleMaps
                    </span>
                  </h3>
                  <p className="text-xs text-stone-300 font-sans leading-relaxed">
                    Ground maritime and shoreline queries directly against real-world Google Maps place entities, coordinates, harbors, and marine reserves near Gulf of Mannar (9.2550°N, 79.2350°E).
                  </p>
                </div>
              </div>

              {/* Search Bar & Quick Chips */}
              <div className="space-y-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleQueryMaps(); }}
                  className="flex items-center gap-2"
                >
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="maps-grounding-query-input"
                      type="text"
                      value={mapsSearchQuery}
                      onChange={(e) => setMapsSearchQuery(e.target.value)}
                      placeholder="Search marine stations, ports, salvage docks, or coral reefs..."
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0E1524] border border-white/15 focus:border-emerald-400 focus:outline-none text-xs text-white placeholder:text-stone-500 font-sans"
                    />
                  </div>
                  <button
                    id="maps-grounding-query-btn"
                    type="submit"
                    disabled={mapsLoading || !mapsSearchQuery.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 text-black font-extrabold text-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-lg shadow-emerald-500/20"
                  >
                    {mapsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    <span>Query Maps</span>
                  </button>
                </form>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-stone-400">Quick Presets:</span>
                  {[
                    'Mandapam Marine Station & Coral Labs',
                    'Rameswaram Fishing Harbor & Boat Slipways',
                    'Gulf of Mannar Marine National Park Headquarters',
                    'Dhanushkodi Coast Guard Outpost & Emergency Berths'
                  ].map((preset, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => { setMapsSearchQuery(preset); handleQueryMaps(preset); }}
                      className="text-xs font-mono px-3 py-1 rounded-lg bg-white/5 hover:bg-emerald-950 hover:text-emerald-300 text-stone-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      {preset.split('&')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Results Display */}
              {mapsLoading && (
                <div className="p-8 rounded-2xl bg-[#090E17] border border-emerald-500/30 flex items-center justify-center gap-3 text-xs font-mono text-emerald-300">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Grounding against Google Maps Platform database...</span>
                </div>
              )}

              {mapsResponseText && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-[#0B1322] border border-white/10 space-y-3">
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      GROUNDED GEOGRAPHIC ANALYSIS
                    </span>
                    <div className="text-xs sm:text-[13px] text-stone-200 font-sans leading-relaxed whitespace-pre-wrap">
                      {mapsResponseText}
                    </div>
                  </div>

                  {/* Maps Links */}
                  {mapsLinks.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                        VERIFIED GOOGLE MAPS PLACE ENTITIES ({mapsLinks.length})
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mapsLinks.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="p-3 rounded-xl bg-[#0F172A] hover:bg-emerald-950/40 border border-white/10 hover:border-emerald-500/40 text-xs font-sans text-stone-200 flex items-center justify-between gap-2 transition-all"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span className="font-semibold truncate">{link.title || 'View on Google Maps'}</span>
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* TAB 2: DOCUMENTATION EXPLORER & REAL-TIME RETRIEVAL */}
        {activeTab === 'search' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080C15] p-4 overflow-y-auto">
            
            {/* Search Input and Filters */}
            <div className="space-y-3 mb-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="rag-search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search technical manuals, acoustic equations, incident SOPs, and user logs..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0E1524] border border-white/15 focus:border-[#2DD4BF] focus:outline-none text-xs text-white placeholder:text-stone-500 font-sans"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Category:
                  </span>
                  <select
                    id="rag-category-filter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[#0E1524] border border-white/15 text-xs text-stone-200 focus:outline-none focus:border-[#2DD4BF] font-mono"
                  >
                    <option value="ALL">All Categories ({totalCorpusCount})</option>
                    <option value="OPERATIONS_SALVAGE">Marine Operations & Salvage</option>
                    <option value="SYSTEM_USAGE">System Usage Guides</option>
                    <option value="SONAR_ACOUSTICS">Sonar & Acoustic Physics</option>
                    <option value="AUV_COMMUNICATIONS">AUV & Acoustic Comms</option>
                    <option value="INCIDENTS_FLEET">Incidents & Fleet Assets</option>
                    <option value="REGULATIONS_ECOLOGY">Regulations & Ecology</option>
                    <option value="ROLES_WORKFLOWS">Roles & Permissions (RBAC)</option>
                    <option value="SYSTEM_ARCHITECTURE">System Architecture</option>
                    <option value="USER_NOTES">User Notes & Logs ({userDocs.length})</option>
                  </select>
                </div>
              </div>

              {/* Category Quick Pills */}
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {[
                  { label: 'All', id: 'ALL' },
                  { label: 'Marine Operations', id: 'OPERATIONS_SALVAGE' },
                  { label: 'System Usage', id: 'SYSTEM_USAGE' },
                  { label: 'Sonar Acoustics', id: 'SONAR_ACOUSTICS' },
                  { label: 'AUV Telemetry', id: 'AUV_COMMUNICATIONS' },
                  { label: 'User Notes', id: 'USER_NOTES' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-[#2DD4BF]/20 border-[#2DD4BF] text-[#2DD4BF] font-bold'
                        : 'bg-white/5 border-white/10 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Results List */}
            <div className="flex-1 overflow-y-auto space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-stone-400 px-1">
                <span>
                  {isSearching ? 'Querying index...' : `Retrieved ${searchResults.length} indexed documents`}
                </span>
                {searchQuery && (
                  <span className="text-teal-400">Search grounded on query: "{searchQuery}"</span>
                )}
              </div>

              {searchResults.length === 0 ? (
                <div className="p-8 text-center bg-[#0E1524]/60 rounded-2xl border border-white/5 text-stone-400">
                  <BookOpen className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                  <p className="text-xs">No documents matched your query and category filter.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('ALL'); }}
                    className="mt-3 px-3 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 text-xs font-mono hover:bg-teal-500/30 transition-colors"
                  >
                    Reset Search Filter
                  </button>
                </div>
              ) : (
                searchResults.map((res, index) => (
                  <div
                    key={res.doc.id || index}
                    className="p-4 rounded-xl bg-[#0E1524] border border-white/10 hover:border-teal-500/40 transition-all group flex flex-col gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/30">
                            {res.doc.category}
                          </span>
                          <span className="text-[10px] font-mono text-stone-400">{res.doc.id}</span>
                          {res.score !== undefined && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FFFF23]/10 text-[#FFFF23] border border-[#FFFF23]/20">
                              Relevance: {Math.round(res.score * 100)}%
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-[#2DD4BF] transition-colors">
                          {res.doc.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setSelectedDocForModal(res.doc)}
                          className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-[#2DD4BF] hover:text-black text-xs font-mono font-bold transition-colors flex items-center gap-1"
                          title="Read full documentation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Doc</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('chat');
                            handleSend(`Explain how ${res.doc.title} is applied during operations and summarize its core steps.`);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-teal-950 hover:bg-teal-800 text-teal-300 border border-teal-500/30 text-xs font-mono transition-colors flex items-center gap-1"
                          title="Ask Copilot about this document"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#FFFF23]" />
                          <span>Ask Copilot</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-300 font-sans leading-relaxed">
                      {res.doc.summary}
                    </p>

                    {/* Matched snippet highlights */}
                    {res.matchedSnippets && res.matchedSnippets.length > 0 && (
                      <div className="bg-black/40 p-2 rounded-lg border border-white/5 text-[11px] font-mono text-stone-300">
                        <span className="text-[10px] text-teal-400 uppercase font-bold block mb-1">
                          Matched Excerpt:
                        </span>
                        <p className="italic">"{res.matchedSnippets[0]}"</p>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-white/5">
                      <div className="flex flex-wrap gap-1">
                        {res.doc.tags.slice(0, 4).map((tag, tIdx) => (
                          <span key={tIdx} className="px-1.5 py-0.5 rounded bg-white/5 text-stone-400">
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <span className="text-stone-500 truncate max-w-[250px]">
                        Sources: {res.doc.citations.join(', ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: USER-PROVIDED NOTES & FIELD QUERIES INGESTION */}
        {activeTab === 'userDocs' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#080C15] p-4 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column: Form to Ingest Custom Documentation */}
              <div className="lg:col-span-6 bg-[#0E1524] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FFFF23] text-black flex items-center justify-center font-black">
                      <PlusCircle className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-white">Add Field Document or Operational Note</h3>
                  </div>
                  <p className="text-xs text-stone-400 mb-4">
                    Any note, SOP guideline, or incident log you enter is instantly embedded into the live RAG vector/lexical index and retrieved by Copilot in real-time.
                  </p>

                  {userDocSuccessMsg && (
                    <div className="mb-3 p-2.5 rounded-xl bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-mono flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2DD4BF]" />
                      <span>{userDocSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleAddUserDoc} className="space-y-3 text-xs">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        Document / Note Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newDocTitle}
                        onChange={(e) => setNewDocTitle(e.target.value)}
                        placeholder="e.g., Palk Bay Sector 4 Reef Net Snag Recovery Log"
                        className="w-full px-3 py-2 rounded-xl bg-[#080C15] border border-white/15 focus:border-[#2DD4BF] focus:outline-none text-white font-sans"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-stone-300 mb-1">
                          Category
                        </label>
                        <select
                          value={newDocCategory}
                          onChange={(e) => setNewDocCategory(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-xl bg-[#080C15] border border-white/15 text-stone-200 focus:outline-none focus:border-[#2DD4BF] font-mono"
                        >
                          <option value="USER_NOTES">User Operational Note</option>
                          <option value="OPERATIONS_SALVAGE">Salvage & Recovery Protocol</option>
                          <option value="SYSTEM_USAGE">System Usage Procedure</option>
                          <option value="SONAR_ACOUSTICS">Sonar & Hydrographic Observation</option>
                          <option value="INCIDENTS_FLEET">Vessel / Crew Incident Log</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-stone-300 mb-1">
                          Keywords / Tags (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={newDocTags}
                          onChange={(e) => setNewDocTags(e.target.value)}
                          placeholder="e.g. coral, shear, 455khz, net"
                          className="w-full px-3 py-2 rounded-xl bg-[#080C15] border border-white/15 focus:border-[#2DD4BF] focus:outline-none text-white font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-stone-300 mb-1">
                        Detailed Technical Content / Field Notes *
                      </label>
                      <textarea
                        required
                        rows={5}
                        value={newDocContent}
                        onChange={(e) => setNewDocContent(e.target.value)}
                        placeholder="Detail observations, acoustic parameters, salvage cut coordinates, crane rigging details, or operator checklists..."
                        className="w-full px-3 py-2 rounded-xl bg-[#080C15] border border-white/15 focus:border-[#2DD4BF] focus:outline-none text-white font-sans text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#26b4a2] text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Index into RAG Knowledge Corpus</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Existing User Documents */}
              <div className="lg:col-span-6 bg-[#0E1524] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-teal-400" />
                    <span>Active User Documents ({userDocs.length})</span>
                  </h3>
                  <span className="text-[10px] font-mono text-stone-400">Stored in Local Index</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 max-h-[420px] pr-1">
                  {userDocs.length === 0 ? (
                    <div className="p-8 text-center bg-[#080C15] rounded-xl border border-white/5 text-stone-400">
                      <BookMarked className="w-8 h-8 text-stone-600 mx-auto mb-2" />
                      <p className="text-xs">No user documents indexed yet.</p>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Use the form on the left to add vessel logs or custom SOPs.
                      </p>
                    </div>
                  ) : (
                    userDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="p-3 rounded-xl bg-[#080C15] border border-white/10 hover:border-teal-500/40 transition-colors flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#FFFF23]/20 text-[#FFFF23] border border-[#FFFF23]/30 mr-2">
                              {doc.category}
                            </span>
                            <h4 className="font-bold text-xs text-white inline">{doc.title}</h4>
                          </div>
                          <button
                            onClick={() => handleDeleteUserDoc(doc.id)}
                            className="p-1 rounded-lg hover:bg-rose-950 text-stone-500 hover:text-rose-400 transition-colors"
                            title="Delete user document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <p className="text-xs text-stone-300 line-clamp-2">
                          {doc.content}
                        </p>

                        <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 pt-1 border-t border-white/5">
                          <span>{doc.id}</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedDocForModal(doc)}
                              className="text-teal-400 hover:underline"
                            >
                              Read Full
                            </button>
                            <button
                              onClick={() => {
                                setActiveTab('chat');
                                handleSend(`What are the key technical findings in the user document "${doc.title}"?`);
                              }}
                              className="text-[#FFFF23] hover:underline"
                            >
                              Query in Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM USAGE QUICK GUIDES */}
        {activeTab === 'usageGuides' && (
          <div className="flex-1 overflow-y-auto bg-[#080C15] p-4 sm:p-6 space-y-4">
            <div className="mb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2DD4BF]" />
                <span>MarineSight System Usage & Workflow Playbooks</span>
              </h3>
              <p className="text-xs text-stone-400">
                Click any guide to review step-by-step instructions or launch a guided technical query in the Copilot.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  id: 'DOC-SYS-01',
                  title: 'Sonar Studio Ingestion & Shadow Triangulation',
                  icon: Waves,
                  desc: 'How to ingest hydroacoustic recordings (.DAT, .XTF, .RAW), switch dual-frequency 455/900 kHz, and calculate 3D debris height from acoustic shadows.',
                  query: 'How do I upload sonar recordings and compute debris height in Sonar Studio?'
                },
                {
                  id: 'DOC-SYS-02',
                  title: 'YOLOv9 Surface Vision Studio & Drone Streams',
                  icon: Eye,
                  desc: 'Operational manual for optical surface debris detection, live RTSP drone stream ingestion, confidence threshold adjustment, and annotation verification.',
                  query: 'How do I run surface debris detection in the Vision Studio?'
                },
                {
                  id: 'DOC-SYS-03',
                  title: 'Incident Command & Priority Scoring Engine',
                  icon: ShieldAlert,
                  desc: 'Workflow guide for prioritizing marine hazards using the 4-factor risk algorithm (0-100) and dispatching response vessels (RV Sagar Guardian, Vajra-2, Coral Star).',
                  query: 'How does the incident priority scoring formula (0-100) work?'
                },
                {
                  id: 'DOC-SYS-04',
                  title: 'Hydrodynamic Drift Modeling & Windage Simulation',
                  icon: Compass,
                  desc: 'Running 72-hour forward and backward particle dispersion simulations to predict where debris will accumulate or trace back to illegal dumping origins.',
                  query: 'How do I simulate debris drift over 72 hours?'
                },
                {
                  id: 'DOC-OPS-01',
                  title: 'SOP: Subsea Ghost Net Salvage & Hydraulic Shears',
                  icon: Anchor,
                  desc: 'Naval standard operating procedure for extracting entangled monofilament trawl nets and gillnets using hydraulic cutting shears and pneumatic lift bags.',
                  query: 'What is the step-by-step procedure for subsea ghost net removal?'
                },
                {
                  id: 'DOC-SYS-05',
                  title: 'User Roles, Security Vault & PII Encryption',
                  icon: Cpu,
                  desc: 'Cryptographic salting, role clearances (Admin, Operator, Researcher, Cleanup, Viewer), and Zero-Knowledge PII privacy protection.',
                  query: 'How does Zero-Knowledge PII masking protect operator details?'
                }
              ].map((guide, gIdx) => {
                const IconComponent = guide.icon;
                return (
                  <div
                    key={gIdx}
                    className="p-4 rounded-xl bg-[#0E1524] border border-white/10 hover:border-[#2DD4BF]/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-950 text-teal-300 border border-teal-500/30 flex items-center justify-center group-hover:bg-[#2DD4BF] group-hover:text-black transition-colors">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono text-[#FFFF23] bg-[#FFFF23]/10 px-2 py-0.5 rounded border border-[#FFFF23]/20">
                          {guide.id}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-white mb-1.5 group-hover:text-[#2DD4BF] transition-colors">
                        {guide.title}
                      </h4>
                      <p className="text-xs text-stone-300 leading-relaxed mb-4">
                        {guide.desc}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                      <button
                        onClick={() => {
                          const doc = RAG_KNOWLEDGE_BASE.find(d => d.id === guide.id);
                          if (doc) setSelectedDocForModal(doc);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-mono text-stone-200 transition-colors"
                      >
                        Read Documentation
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('chat');
                          handleSend(guide.query);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-[#2DD4BF] hover:bg-[#26b4a2] text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Query Copilot</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* MODAL: Full Technical Document Reader */}
      {selectedDocForModal && (
        <div className="fixed inset-0 z-60 overflow-y-auto p-4 md:p-8 flex items-center justify-center animate-in fade-in duration-150">
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedDocForModal(null)}
          />

          <div className="relative w-full max-w-3xl bg-[#090E17] rounded-2xl shadow-2xl border border-teal-500/40 overflow-hidden flex flex-col max-h-[85vh] text-white">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#0B1322] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2DD4BF] text-black flex items-center justify-center font-black">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#FFFF23]">{selectedDocForModal.id}</span>
                  <h3 className="font-bold text-sm text-white truncate max-w-[450px]">
                    {selectedDocForModal.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedDocForModal(null)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-sans">
              <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-white/10">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-500/30">
                  CATEGORY: {selectedDocForModal.category}
                </span>
                <span className="text-[11px] font-mono text-stone-400">
                  Citations: {selectedDocForModal.citations.join(' | ')}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-[#2DD4BF] uppercase block mb-1">
                  Executive Summary:
                </span>
                <p className="text-stone-300 leading-relaxed bg-[#0E1524] p-3 rounded-xl border border-white/5">
                  {selectedDocForModal.summary}
                </p>
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold text-[#2DD4BF] uppercase block mb-1">
                  Full Technical Text & Operational Formulation:
                </span>
                <div className="bg-[#05080E] p-4 rounded-xl border border-white/10 text-stone-200 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">
                  {selectedDocForModal.content}
                </div>
              </div>

              {selectedDocForModal.sampleQuestions && selectedDocForModal.sampleQuestions.length > 0 && (
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-400 uppercase block mb-1.5">
                    Recommended Technical Inquiries:
                  </span>
                  <div className="space-y-1.5">
                    {selectedDocForModal.sampleQuestions.map((q, qIdx) => (
                      <button
                        key={qIdx}
                        onClick={() => {
                          setSelectedDocForModal(null);
                          setActiveTab('chat');
                          handleSend(q);
                        }}
                        className="w-full text-left p-2 rounded-lg bg-[#0E1524] hover:bg-teal-950/60 border border-white/5 hover:border-teal-500/30 text-stone-300 hover:text-teal-200 text-xs font-mono transition-colors flex items-center justify-between"
                      >
                        <span>"{q}"</span>
                        <ArrowRight className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-[#0B1322] border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-stone-400">
                MarineSight RAG Grounding Engine
              </span>
              <button
                onClick={() => {
                  const docTitle = selectedDocForModal.title;
                  setSelectedDocForModal(null);
                  setActiveTab('chat');
                  handleSend(`Summarize the core technical parameters and operational guidelines in ${docTitle}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#26b4a2] text-black font-extrabold text-xs transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Copilot About This Doc</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
