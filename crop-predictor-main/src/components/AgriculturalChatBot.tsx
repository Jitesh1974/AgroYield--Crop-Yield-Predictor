import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Send, Leaf, ArrowUp, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  segments?: Array<{
    type: 'climate' | 'yield' | 'advisory' | 'nutrition' | 'schemes';
    title: string;
    content: string;
    icon: string;
  }>;
}

interface AgriculturalChatBotProps {
  onStartPrediction: () => void;
}

const AgriculturalChatBot = ({ onStartPrediction }: AgriculturalChatBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('agri-chat-history');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial greeting
      const initialMessage: Message = {
        id: '1',
        text: "Welcome! I'm Agri-Assistant. I can help you understand our yield prediction tool. What's your first question?",
        isBot: true,
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('agri-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const scrollToStartButton = () => {
    const startButton = document.querySelector('[data-start-prediction]');
    if (startButton) {
      startButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Fallback: scroll to hero section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleQuickReply = (type: string) => {
    let responseText = "";
    
    switch (type) {
      case 'start':
        scrollToStartButton();
        onStartPrediction();
        return;
      case 'how-it-works':
        responseText = "Our yield prediction tool works in 5 simple steps:\n\n🎯 **Step 1**: Enter your location (District & Taluka)\n🌱 **Step 2**: Provide soil details (color, pH, nutrients)\n🧪 **Step 3**: Select fertilizer type\n🌧️ **Step 4**: Input rainfall and temperature data\n🌾 **Step 5**: Choose your crop type\n\nOur AI analyzes all these factors to give you accurate yield predictions with actionable insights!";
        break;
      case 'data-needed':
        responseText = "Here's what data you'll need to provide:\n\n📍 **Location**: District and Taluka\n🌱 **Soil Info**: Color, pH level, Nitrogen, Phosphorus, Potassium\n🧪 **Fertilizer**: Type of fertilizer used\n🌧️ **Weather**: Rainfall amount, minimum & maximum temperature\n🌾 **Crop**: Type of crop you want to grow\n\nDon't worry if you don't have exact values - estimates work too!";
        break;
      default:
        responseText = "I'm here to help! Feel free to ask me anything about yield prediction.";
    }

    addBotMessage(responseText);
  };

  const addBotMessage = (text: string, segments?: Message['segments']) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: true,
      timestamp: new Date(),
      segments
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  const addUserMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

const simulateBotResponse = async (userMessage: string) => {
  setIsTyping(true);

  try {
    const response = await fetch("http://localhost:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage, lang: "en" }),
    });

    const data = await response.json();
    const botReply = data.reply || "Sorry, I couldn't process your query.";
    addBotMessage(botReply);

  } catch (error) {
    console.error("API error:", error);
    addBotMessage("⚠️ Backend is not reachable. Please try again later.");
  }

  setIsTyping(false);
};


  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    addUserMessage(userMessage);
    setInputValue("");

    // Simulate bot response
    await simulateBotResponse(userMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Launcher */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce-subtle"
          size="icon"
        >
          <Leaf className="h-8 w-8 text-primary-foreground" />
        </Button>
      )}

      {/* Chat Window - 85% Width Bottom Bar */}
      {isOpen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-[85%] bg-background border border-border shadow-2xl animate-slide-in-bottom rounded-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Leaf className="h-6 w-6" />
              <h3 className="font-semibold text-lg">Agri-Assistant</h3>
              <span className="text-primary-foreground/80 text-sm">Ask me about yield prediction, irrigation, and farming advice</span>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-white/20"
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex h-80">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-subtle">
              {messages.map((message) => (
                <div key={message.id} className={cn(
                  "flex",
                  message.isBot ? "justify-start" : "justify-end"
                )}>
                  <div className={cn(
                    "max-w-[70%] p-4 rounded-lg",
                    message.isBot 
                      ? "bg-primary/10 text-foreground border border-primary/20" 
                      : "bg-white text-foreground shadow-sm border"
                  )}>
                    <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
                    
                    {/* Segmented Response */}
                    {message.segments && (
                      <div className="mt-4 space-y-3">
                        {message.segments.map((segment, index) => (
                          <div key={index} className="bg-white/80 p-3 rounded-lg border-l-4 border-primary shadow-sm">
                            <div className="font-semibold text-sm text-primary flex items-center gap-2 mb-2">
                              <span className="text-lg">{segment.icon}</span>
                              {segment.title}
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {segment.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-primary/10 text-foreground p-4 rounded-lg border border-primary/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Reply Panel */}
            <div className="w-80 border-l border-border p-6 bg-background/50">
              <h4 className="font-semibold text-foreground mb-4">Quick Actions</h4>
              
              {/* Quick Reply Buttons - Show only after initial message */}
              {messages.length <= 2 && !isTyping && (
                <div className="space-y-3">
                  <Button
                    onClick={() => handleQuickReply('start')}
                    variant="outline"
                    className="w-full justify-start text-sm bg-white hover:bg-primary/10 border-primary/30"
                  >
                    <ArrowUp className="h-4 w-4 mr-3" />
                    Start Prediction Tool
                  </Button>
                  <Button
                    onClick={() => handleQuickReply('how-it-works')}
                    variant="outline"
                    className="w-full justify-start text-sm bg-white hover:bg-primary/10 border-primary/30"
                  >
                    How does the tool work?
                  </Button>
                  <Button
                    onClick={() => handleQuickReply('data-needed')}
                    variant="outline"
                    className="w-full justify-start text-sm bg-white hover:bg-primary/10 border-primary/30"
                  >
                    What data is needed?
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6 border-t bg-background">
            <div className="max-w-4xl mx-auto flex gap-4">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about crops, irrigation, fertilizers, or anything agriculture-related..."
                className="flex-1 h-12 text-base px-4"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage}
                size="lg"
                className="bg-primary hover:bg-primary-glow px-6"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="h-5 w-5 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgriculturalChatBot;