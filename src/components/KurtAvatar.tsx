import { Mic, MessageSquare } from "lucide-react";

interface KurtAvatarProps {
  isListening?: boolean;
  message?: string;
  size?: "default" | "sm";
  name?: string;
  currentWordIndex?: number;
  isProcessing?: boolean;
  compact?: boolean;
}

const KurtAvatar = ({ isListening = false, message = "Hi! Let's get you set up.", size = "default", name = "Kurt", currentWordIndex = 0, isProcessing = false, compact = false }: KurtAvatarProps) => {
  const words = message.split(' ');
  
  // Compact header mode - small circle with name
  if (compact) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30 flex items-center justify-center shadow-sm">
          <span className="text-base font-bold text-primary">{name.charAt(0)}</span>
        </div>
        <span className="text-lg font-medium text-foreground">{name}</span>
      </div>
    );
  }
  
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
        <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-500 ${
          isProcessing ? 'bg-primary/2 opacity-30' : 'bg-primary/5'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`} />
        
        {/* Outermost circle - lightest */}
        <div className={`absolute inset-0 rounded-full border transition-all duration-500 ${
          isProcessing ? 'bg-primary/2 border-primary/5 opacity-30' : 'bg-primary/5 border-primary/10'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`} />
        
        {/* Second circle */}
        <div className={`absolute inset-4 rounded-full border transition-all duration-500 ${
          isProcessing ? 'bg-primary/3 border-primary/8 opacity-30' : 'bg-primary/8 border-primary/15'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.2s' : '0.1s' }} />
        
        {/* Third circle */}
        <div className={`absolute inset-8 rounded-full border transition-all duration-500 ${
          isProcessing ? 'bg-primary/4 border-primary/10 opacity-30' : 'bg-primary/12 border-primary/20'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.4s' : '0.2s' }} />
        
        {/* Fourth circle */}
        <div className={`absolute inset-12 rounded-full border transition-all duration-500 ${
          isProcessing ? 'bg-primary/5 border-primary/12 opacity-30' : 'bg-primary/18 border-primary/30'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.6s' : '0.3s' }} />
        
        {/* Inner circle */}
        <div className={`absolute inset-16 rounded-full border transition-all duration-500 ${
          isProcessing ? 'bg-primary/8 border-primary/15 opacity-30' : 'bg-primary/25 border-primary/40'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '0.8s' : '0.4s' }} />
        
        {/* Center circle */}
        <div className={`absolute inset-20 rounded-full border flex items-center justify-center transition-all duration-500 ${
          isProcessing ? 'bg-primary/10 border-primary/20 opacity-40' : 'bg-primary/30 border-primary/50'
        } ${isListening ? 'animate-kurt-pulse-active' : 'animate-kurt-pulse'}`}
             style={{ animationDelay: isListening ? '1s' : '0.5s' }}>
          {isListening && (
            <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
          )}
          {isProcessing && (
            <div className="flex gap-1.5">
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary shadow-lg" style={{ animationDelay: "0ms" }} />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary shadow-lg" style={{ animationDelay: "150ms" }} />
              <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary shadow-lg" style={{ animationDelay: "300ms" }} />
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
