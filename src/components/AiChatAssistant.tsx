import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare,
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Sparkles,
  DollarSign,
  Clock,
  ShieldAlert
} from 'lucide-react';
import { ChatMessage, FullEventPlan } from '../types/event';
import { sendChatMessage } from '../services/geminiApi';

interface AiChatAssistantProps {
  plan: FullEventPlan;
}

const QUICK_PROMPTS = [
  { icon: <DollarSign className="w-3.5 h-3.5" />, label: 'Cut 20% from budget', prompt: 'How can I safely cut 20% from my catering and decor budget without ruining guest experience?' },
  { icon: <ShieldAlert className="w-3.5 h-3.5" />, label: 'Vendor contract red flags', prompt: 'What are the top hidden fees and contract red flags I should look out for before booking vendors?' },
  { icon: <Clock className="w-3.5 h-3.5" />, label: 'Day-of minute schedule', prompt: 'Review our day-of timeline and give me a detailed minute-by-minute run of show with buffer times.' },
  { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Creative guest activities', prompt: 'Give me 3 memorable and interactive guest activities or games suited for this event.' },
];

export const AiChatAssistant: React.FC<AiChatAssistantProps> = ({ plan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `👋 Hello! I'm **Planora**, your GenAI planning director. 
I have full context of your **${plan.details.title}** (${plan.details.guestCount} guests, ${plan.details.currency} ${plan.details.totalBudget.toLocaleString()} budget, scheduled for ${plan.details.date}).

How can I help optimize your event today? You can ask me to adjust budgets, generate negotiation scripts, review timelines, or suggest personalized theme concepts!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setIsTyping(true);

    try {
      const response = await sendChatMessage(messages, plan, textToSend);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: "I encountered a minor network issue. Please check your connection or try again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        role: 'assistant',
        content: `Chat reset. I'm ready to assist with **${plan.details.title}**. What would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[700px] max-h-[80vh] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              Planora AI Planner
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h3>
            <p className="text-[11px] text-slate-500">
              Context-Aware Assistant • {plan.details.title}
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors text-xs flex items-center gap-1"
          title="Reset Chat Session"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Clear</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-800 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-line'
                }`}
              >
                <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900">
                  {msg.content}
                </div>
                <div
                  className={`text-[10px] mt-1 ${
                    isUser ? 'text-indigo-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-2 sm:px-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {QUICK_PROMPTS.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp.prompt)}
            disabled={isTyping}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          >
            {qp.icon}
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask Planora to analyze expenses, write vendor emails, or suggest party ideas..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl cursor-pointer transition-colors shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
