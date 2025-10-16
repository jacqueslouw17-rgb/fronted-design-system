import { Mic, MessageSquare } from "lucide-react";

interface KurtAvatarProps {
  isListening?: boolean;
  message?: string;
  size?: "default" | "sm";
  name?: string;
  currentWordIndex?: number;
  isProcessing?: boolean;
}

const KurtAvatar = ({ isListening = false, message = "Hi! Let's get you set up.", size = "default", name = "Kurt", currentWordIndex = 0, isProcessing = false }: KurtAvatarProps) => {
  const words = message.split(' ');
  if (size === "sm") {
    return (
      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <span className="text-xs">🧞‍♂️</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Kurt Avatar - Concentric gradient circles */}
      <div className={`relative w-48 h-48 ${isListening ? 'animate-kurt-breathe' : ''}`}>
        {/* Outer glow effect */}
        <div className={`absolute inset-0 rounded-full bg-primary/5 blur-3xl ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`} />
        
        {/* Outermost circle - lightest */}
        <div className={`absolute inset-0 rounded-full bg-primary/5 border border-primary/10 transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`} />
        
        {/* Second circle */}
        <div className={`absolute inset-4 rounded-full bg-primary/8 border border-primary/15 transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.2s' : '0.1s' }} />
        
        {/* Third circle */}
        <div className={`absolute inset-8 rounded-full bg-primary/12 border border-primary/20 transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.4s' : '0.2s' }} />
        
        {/* Fourth circle */}
        <div className={`absolute inset-12 rounded-full bg-primary/18 border border-primary/30 transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.6s' : '0.3s' }} />
        
        {/* Inner circle */}
        <div className={`absolute inset-16 rounded-full bg-primary/25 border border-primary/40 transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.8s' : '0.4s' }} />
        
        {/* Center circle */}
        <div className={`absolute inset-20 rounded-full bg-primary/30 border border-primary/50 flex items-center justify-center transition-all duration-500 ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '1s' : '0.5s' }}>
          {isListening && (
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          )}
          {isProcessing && (
            <div className="flex gap-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
              <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
            </div>
          )}
        </div>
      </div>

      {/* Status text */}
      <p className="text-lg font-medium text-foreground">
        {isListening ? `${name} is listening...` : isProcessing ? `${name} is working...` : name}
      </p>

      {/* Message bubble with word highlighting */}
      <div className="bg-muted/50 px-6 py-3 rounded-full shadow-sm max-w-lg text-center border border-border">
        <p className="text-sm">
          {words.map((word, index) => (
            <span
              key={index}
              className={`transition-colors duration-150 ${
                index < currentWordIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
              }`}
            >
              {word}{index < words.length - 1 ? ' ' : ''}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
};

export default KurtAvatar;
