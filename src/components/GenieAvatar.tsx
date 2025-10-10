import { Mic, MessageSquare } from "lucide-react";

interface GenieAvatarProps {
  isListening?: boolean;
  message?: string;
}

const GenieAvatar = ({ isListening = false, message = "Hi! Let's get you set up." }: GenieAvatarProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Genie Avatar - Concentric gradient circles */}
      <div className="relative w-48 h-48">
        {/* Outer glow effect */}
        <div className={`absolute inset-0 rounded-full bg-primary/20 blur-3xl ${isListening ? 'animate-genie-pulse' : ''}`} />
        
        {/* Outermost circle - lightest */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/15 animate-genie-pulse' : 'bg-primary/10'}`} />
        
        {/* Second circle */}
        <div className={`absolute inset-4 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/25 animate-genie-pulse' : 'bg-primary/20'}`}
             style={{ animationDelay: '0.1s' }} />
        
        {/* Third circle */}
        <div className={`absolute inset-8 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/40 animate-genie-pulse' : 'bg-primary/30'}`}
             style={{ animationDelay: '0.2s' }} />
        
        {/* Fourth circle */}
        <div className={`absolute inset-12 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/55 animate-genie-pulse' : 'bg-primary/45'}`}
             style={{ animationDelay: '0.3s' }} />
        
        {/* Inner circle */}
        <div className={`absolute inset-16 rounded-full transition-all duration-300 ${isListening ? 'bg-primary/70 animate-genie-pulse' : 'bg-primary/60'}`}
             style={{ animationDelay: '0.4s' }} />
        
        {/* Center circle - darkest */}
        <div className={`absolute inset-20 rounded-full transition-all duration-300 flex items-center justify-center ${isListening ? 'bg-primary animate-genie-pulse' : 'bg-primary/85'}`}
             style={{ animationDelay: '0.5s' }}>
          {isListening && (
            <div className="w-3 h-3 rounded-full bg-white animate-genie-pulse" />
          )}
        </div>
      </div>

      {/* Status text */}
      <p className="text-lg font-medium text-foreground">
        {isListening ? "Genie is listening..." : "Genie"}
      </p>

      {/* Message bubble */}
      <div className="bg-accent px-6 py-3 rounded-full shadow-sm max-w-md text-center border border-border">
        <p className="text-sm text-accent-foreground">
          {message}
        </p>
      </div>
    </div>
  );
};

export default GenieAvatar;
