import { Mic, MessageSquare } from "lucide-react";

interface GenieAvatarProps {
  isListening?: boolean;
  message?: string;
}

const GenieAvatar = ({ isListening = false, message = "Hi! Let's get you set up." }: GenieAvatarProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Genie Avatar - Multi-ring design */}
      <div className="relative w-40 h-40">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl animate-genie-pulse" />
        
        {/* Outermost ring */}
        <div className={`absolute inset-0 rounded-full border-4 border-primary/30 ${isListening ? 'animate-genie-pulse' : ''}`} />
        
        {/* Middle ring */}
        <div className={`absolute inset-4 rounded-full border-[6px] border-primary/50 ${isListening ? 'animate-genie-pulse' : ''}`} 
             style={{ animationDelay: '0.1s' }} />
        
        {/* Inner ring with arc effect */}
        <div className="absolute inset-8 rounded-full overflow-hidden">
          <div className={`absolute inset-0 rounded-full border-[8px] border-primary ${isListening ? 'animate-genie-pulse' : ''}`}
               style={{ animationDelay: '0.2s' }} />
          
          {/* Arc accent (partial circle) */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeDasharray="70 100"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className={isListening ? 'animate-genie-pulse' : ''}
              style={{ animationDelay: '0.3s' }}
            />
          </svg>
        </div>
        
        {/* Center circle */}
        <div className={`absolute inset-12 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center ${isListening ? 'animate-genie-pulse' : ''}`}
             style={{ animationDelay: '0.4s' }}>
          {/* Small dot accent */}
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary ${isListening ? 'animate-genie-pulse' : ''}`}
               style={{ animationDelay: '0.5s' }} />
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
