import React, { useState, useRef, useEffect } from 'react';
import { AnalysisResult, ChatMessage, UserProfile } from '../types/skillLens';
import { askSkillAssistantAPI } from '../utils/api';
import {
  MessageSquare,
  Send,
  X,
  Sparkles,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Zap,
} from 'lucide-react';

interface SkillLensAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnalysis: AnalysisResult | null;
  userProfile: UserProfile | null;
}

const SUGGESTED_PROMPTS = [
  'What should I learn first?',
  'Why are missing skills marked as high priority?',
  'Which of my skills match this role?',
  'What should I improve next?',
];

export const SkillLensAssistant: React.FC<SkillLensAssistantProps> = ({
  isOpen,
  onClose,
  currentAnalysis,
  userProfile,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: currentAnalysis
        ? `Hello! I am your SkillLens Assistant. I can answer questions specifically grounded in your ${currentAnalysis.targetRole} skill analysis (Readiness: ${currentAnalysis.readinessScore}%). Ask me about priorities, roadmaps, or matched skills!`
        : `Hello! I am your SkillLens Assistant. Once you complete an analysis, I can help explain your skill gaps, priority rankings, and recommended learning sequence based strictly on your provided information.`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const answer = await askSkillAssistantAPI({
        question: textToSend,
        currentAnalysis,
        userProfile,
        chatHistory: messages.map((m) => ({ sender: m.sender, text: m.text })),
      });

      const aiMsg: ChatMessage = {
        id: 'msg_ai_' + Date.now(),
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: 'msg_err_' + Date.now(),
        sender: 'assistant',
        text: "I don't have enough information to determine that.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="max-w-xl w-full h-[620px] max-h-[90vh] rounded-3xl bg-slate-900 border border-indigo-500/40 shadow-2xl shadow-indigo-500/20 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-indigo-500/20 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/40">
              <Sparkles className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <span>SkillLens Assistant</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Grounded AI
                </span>
              </h3>
              <span className="text-[11px] text-slate-400 block">
                Calibrated exclusively on your current analysis data
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#090b12]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-[10px] shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-tr from-pink-500 to-rose-500 text-white shadow-rose-500/30'
                    : 'bg-gradient-to-tr from-indigo-500 to-cyan-500 text-slate-950 font-bold shadow-cyan-500/30'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-slate-950" />}
              </div>
              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-purple-600/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-md'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Verifying analysis data...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
            {SUGGESTED_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={isLoading}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500/30 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 border-t border-slate-800 flex items-center gap-2 bg-slate-900"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your skill gap analysis..."
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white disabled:opacity-40 transition-all shadow-md shadow-purple-600/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
