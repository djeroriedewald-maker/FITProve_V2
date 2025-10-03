import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageCircle, 
  Zap,
  Minimize2,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi there! 👋 I'm your AI fitness assistant. I can help you with workout plans, exercise techniques, nutrition advice, and answer any fitness-related questions. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sample AI responses for demo purposes
  const aiResponses = [
    "That's a great question! For building muscle mass, I'd recommend focusing on compound movements like squats, deadlifts, and bench press. Aim for 3-4 sets of 8-12 reps with progressive overload.",
    "Nutrition plays a crucial role in your fitness journey! Make sure you're getting adequate protein (0.8-1g per lb of body weight), staying hydrated, and eating in a slight calorie surplus for muscle gain.",
    "Form is everything! I'd suggest starting with lighter weights and focusing on proper technique. Consider working with a trainer initially or recording yourself to check your form.",
    "Rest and recovery are just as important as training! Aim for 7-9 hours of quality sleep and allow at least 48 hours between training the same muscle groups.",
    "Cardio can complement your strength training beautifully! Try 2-3 sessions per week of moderate intensity cardio, or incorporate HIIT for time efficiency.",
  ];

  const quickSuggestions = [
    "How do I build muscle?",
    "Best exercises for beginners",
    "Nutrition tips for weight loss",
    "How to improve my form?",
    "What's a good workout split?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Chat cleared! How can I help you today?",
        timestamp: new Date()
      }
    ]);
  };

  const chatVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      x: 400, 
      y: 400 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      x: 400, 
      y: 400,
      transition: {
        duration: 0.2
      }
    }
  };

  const minimizedVariants = {
    minimized: {
      height: 60,
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    expanded: {
      height: 500,
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-20 backdrop-blur-sm z-[9998] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Chat Container */}
          <motion.div
            className="fixed bottom-6 right-6 z-[9999] w-80 md:w-96"
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="bg-glass-dark rounded-2xl shadow-2xl overflow-hidden border border-white/10"
              variants={minimizedVariants}
              animate={isMinimized ? "minimized" : "expanded"}
              style={{
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-cyan-400/20 to-purple-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="relative"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        }}
                      >
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <motion.div
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>
                    <div>
                      <h3 className="text-white font-semibold">AI Fitness Coach</h3>
                      <p className="text-white/60 text-xs">Always here to help</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={clearChat}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                      title="Clear chat"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setIsMinimized(!isMinimized)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                      {isMinimized ? (
                        <Maximize2 className="w-4 h-4" />
                      ) : (
                        <Minimize2 className="w-4 h-4" />
                      )}
                    </motion.button>
                    
                    <motion.button
                      onClick={onClose}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Chat Content */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Messages */}
                    <div className="flex-1 p-4 space-y-4 max-h-80 overflow-y-auto">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      
                      {/* Typing Indicator */}
                      {isTyping && (
                        <motion.div
                          className="flex items-center space-x-2"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div className="bg-white/10 rounded-2xl px-4 py-2">
                            <div className="flex space-x-1">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-2 h-2 bg-white/60 rounded-full"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    {messages.length <= 1 && (
                      <div className="px-4 pb-2">
                        <p className="text-white/60 text-xs mb-2">Quick suggestions:</p>
                        <div className="flex flex-wrap gap-2">
                          {quickSuggestions.slice(0, 3).map((suggestion) => (
                            <motion.button
                              key={suggestion}
                              onClick={() => handleSuggestionClick(suggestion)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-3 py-1 text-xs text-white/80 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                            >
                              {suggestion}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input */}
                    <div className="p-4 border-t border-white/10">
                      <form onSubmit={handleSubmit} className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask me anything about fitness..."
                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          disabled={!inputValue.trim() || isTyping}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-400 to-purple-400 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          <Send className="w-4 h-4" />
                        </motion.button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Message Bubble Component
interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isAI = message.type === 'ai';

  return (
    <motion.div
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <motion.div
          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isAI ? 'bg-gradient-to-r from-cyan-400 to-purple-400' : 'bg-gradient-to-r from-orange-400 to-pink-400'
          }`}
          whileHover={{ scale: 1.1, rotate: 5 }}
        >
          {isAI ? (
            <Bot className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-white" />
          )}
        </motion.div>

        {/* Message Content */}
        <div
          className={`px-4 py-2 rounded-2xl relative ${
            isAI
              ? 'bg-white/10 text-white'
              : 'bg-gradient-to-r from-cyan-400 to-purple-400 text-white'
          }`}
          style={isAI ? {
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          } : {}}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* Timestamp */}
          <p className={`text-xs mt-1 opacity-60 ${isAI ? 'text-white' : 'text-white'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>

          {/* AI sparkle effects */}
          {isAI && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${10 + i * 20}%`,
                    top: -8,
                  }}
                  animate={{
                    y: [0, -5, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}