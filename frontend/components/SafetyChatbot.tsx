import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  ShieldCheck,
  Bot,
  User,
  Sparkles,
  AlertCircle,
  HelpCircle,
  BookOpen,
  RefreshCw
} from "lucide-react";
import { ChatMessage, sendSafetyChatMessage } from "@/lib/api";

const SUGGESTED_QUERIES = [
  "⚡ What are the safety standards for exposed electrical wiring?",
  "🚪 What clearance is required in front of emergency fire doors?",
  "🦺 What PPE is mandatory when operating high-speed machinery?",
  "💧 What is the immediate cleanup procedure for an oil spill?",
  "🚫 Write me a Python script to scrape a website" // Off-topic demo to test guardrail
];

interface SafetyChatbotProps {
  userName?: string;
}

export const SafetyChatbot: React.FC<SafetyChatbotProps> = ({ userName = "Employee" }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hello ${userName}! 👋 I am your **Workplace SafetyWatch AI Assistant**.\n\nAsk me anything regarding **workplace safety rules, OSHA standards, PPE requirements, emergency protocols, and hazard mitigation**.\n\n*(Note: I am strictly bounded to workplace safety topics only.)*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const response = await sendSafetyChatMessage(query, messages, userName);
      const botMsg: ChatMessage = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `⚠️ Failed to get safety guidance: ${err.message || 'Service offline'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat session refreshed. How can I assist you with facility safety rules or hazard protocols today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] max-w-4xl mx-auto text-white">
      {/* Chat Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-white">SafetyWatch AI Assistant</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Safety-Domain Guarded
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Instant workplace compliance, OSHA standards & emergency protocol guidance
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-950/40 border-b border-slate-800/80 overflow-x-auto whitespace-nowrap flex space-x-2 scrollbar-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center self-center px-1">
          Try Asking:
        </span>
        {SUGGESTED_QUERIES.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-[11px] text-slate-300 hover:text-emerald-300 transition-all flex-shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-900/50">
        {messages.map((msg, idx) => {
          const isBot = msg.role === "assistant";
          const isOffTopicWarning = isBot && (msg.content.includes("outside my workplace safety domain") || msg.content.includes("⚠️"));

          return (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${isBot ? "" : "flex-row-reverse space-x-reverse"}`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isBot
                    ? isOffTopicWarning
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-blue-600 text-white"
                }`}
              >
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              <div className={`max-w-[80%] space-y-1`}>
                <div
                  className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isBot
                      ? isOffTopicWarning
                        ? "bg-amber-500/10 border border-amber-500/30 text-amber-200"
                        : "bg-slate-800 border border-slate-700/80 text-slate-200"
                      : "bg-blue-600 text-white rounded-br-none"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                <div className={`text-[10px] text-slate-500 px-1 ${isBot ? "text-left" : "text-right"}`}>
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="h-4 w-4 animate-spin" />
            </div>
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-xs text-slate-400 flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Analyzing safety database & standards...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-4 bg-slate-950 border-t border-slate-800 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={e => setInputMessage(e.target.value)}
          placeholder="Ask a question about facility safety rules, OSHA guidelines, PPE, emergency steps..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !inputMessage.trim()}
          className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
};
