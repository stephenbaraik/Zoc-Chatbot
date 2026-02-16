'use client';
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { sendMessage } from '../app/api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userId] = useState(() => Math.floor(Math.random() * 1000000));
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await sendMessage(userId, input);
            const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: res.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const isChatStarted = messages.length > 0;

    return (
        <div className="flex flex-col h-screen bg-[#212121] text-gray-100 font-sans overflow-hidden selection:bg-gray-700 selection:text-white">

            {/* Header (Absolute) */}
            <header className="absolute top-0 left-0 w-full p-6 z-50 pointer-events-none">
                <div className="flex items-center gap-3 opacity-60 hover:opacity-100 transition-opacity pointer-events-auto w-fit">
                    <span className="text-lg font-medium tracking-tight text-white">Ambassador Fellow</span>
                    <span className="bg-[#2F2F2F] border border-white/10 px-2 py-0.5 rounded text-[10px] text-gray-400 font-mono">120B</span>
                </div>
            </header>

            {/* Scrollable Message Area */}
            <div className="flex-1 overflow-y-auto w-full scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                <div className="flex flex-col min-h-full items-center w-full max-w-4xl mx-auto px-4 pt-24 pb-48">

                    {!isChatStarted ? (
                        // Empty State - Centered
                        <div className="flex-1 flex flex-col items-center justify-center w-full animate-in fade-in zoom-in duration-700 my-auto">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-white/5">
                                <Bot className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-3xl font-semibold text-white tracking-tight text-center">
                                How can I help you today?
                            </h2>
                        </div>
                    ) : (
                        // Chat Messages
                        <div className="w-full space-y-8">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, ease: "easeOut" }}
                                        className="w-full max-w-3xl mx-auto group"
                                    >
                                        <div className="flex gap-6">
                                            <div className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
                                                msg.role === 'user' ? "bg-[#2F2F2F] border border-white/5" : "bg-white text-black"
                                            )}>
                                                {msg.role === 'user' ? <User size={16} className="text-gray-300" /> : <Bot size={18} />}
                                            </div>
                                            <div className="prose prose-invert prose-p:leading-relaxed prose-p:text-gray-300 prose-base max-w-none flex-1 font-light">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-4 last:mb-0 leading-7 text-[15px] sm:text-base text-gray-200" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-5 mb-4 space-y-2 text-gray-300" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-5 mb-4 space-y-2 text-gray-300" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-blue-400 hover:text-blue-300 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="font-semibold text-white" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold text-white mt-6 mb-4" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-white mt-5 mb-3" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-white mt-4 mb-2" {...props} />,
                                                        table: ({ node, ...props }) => <div className="overflow-x-auto my-6 border border-white/10 rounded-lg shadow-sm"><table className="w-full text-left border-collapse min-w-[500px]" {...props} /></div>,
                                                        thead: ({ node, ...props }) => <thead className="bg-[#2F2F2F]" {...props} />,
                                                        th: ({ node, ...props }) => <th className="p-3 border-b border-white/10 font-medium text-gray-200 text-sm whitespace-nowrap" {...props} />,
                                                        td: ({ node, ...props }) => <td className="p-3 border-b border-white/5 text-sm text-gray-400" {...props} />,
                                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-2 border-white/20 pl-4 italic text-gray-400 my-4" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-[#2F2F2F] px-1.5 py-0.5 rounded text-sm font-mono text-gray-200 border border-white/5" {...props} />,
                                                    }}
                                                >
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full max-w-3xl mx-auto"
                                >
                                    <div className="flex gap-6">
                                        <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shrink-0 shadow-sm mt-1">
                                            <Bot size={18} />
                                        </div>
                                        <div className="flex items-center gap-1.5 h-8">
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-150" />
                                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse delay-300" />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area (Fixed Bottom) */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#212121] via-[#212121]/95 to-transparent pt-10 pb-6 z-40">
                <div className="w-full max-w-3xl mx-auto px-4">
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700 to-gray-600 rounded-[28px] opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                        <div className="relative bg-[#2F2F2F]/90 backdrop-blur-xl rounded-[26px] shadow-2xl ring-1 ring-white/5 focus-within:ring-white/10 transition-all duration-300">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Message Ambassador Fellow..."
                                className="w-full bg-transparent border-0 px-6 py-4 text-white placeholder:text-gray-500 text-[15px] focus:ring-0 leading-relaxed font-light tracking-wide"
                                autoFocus
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim()}
                                className={cn(
                                    "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-all duration-200",
                                    input.trim()
                                        ? "bg-white text-black hover:bg-gray-200 shadow-lg scale-100"
                                        : "bg-transparent text-gray-600 cursor-not-allowed scale-90 opacity-0"
                                )}
                            >
                                <Send size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-[10px] text-gray-500/80 font-medium tracking-wide uppercase">
                            Ambassador Fellow &bull; AI Generated
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
