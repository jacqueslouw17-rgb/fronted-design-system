import { Mic, MessageSquare } from "lucide-react";

interface KurtAvatarProps {
  isListening?: boolean;
  message?: string;
  size?: "default" | "sm";
}

const KurtAvatar = ({ isListening = false, message = "Hi! Let's get you set up.", size = "default" }: KurtAvatarProps) => {
  if (size === "sm") {
    return (
      <div className="w-8 h-8 rounded-full bg-foreground/60 flex items-center justify-center">
        <span className="text-xs">🧞‍♂️</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Kurt Avatar - Concentric gradient circles */}
      <div className="relative w-48 h-48">
        {/* Outer glow effect */}
        <div className="absolute inset-0 rounded-full bg-foreground/10 blur-3xl animate-kurt-pulse" />
        
        {/* Outermost circle - lightest gray */}
        <div className="absolute inset-0 rounded-full bg-foreground/8 animate-kurt-pulse" />
        
        {/* Second circle */}
        <div className="absolute inset-4 rounded-full bg-foreground/15 animate-kurt-pulse"
             style={{ animationDelay: '0.1s' }} />
        
        {/* Third circle */}
        <div className="absolute inset-8 rounded-full bg-foreground/25 animate-kurt-pulse"
             style={{ animationDelay: '0.2s' }} />
        
        {/* Fourth circle */}
        <div className="absolute inset-12 rounded-full bg-foreground/40 animate-kurt-pulse"
             style={{ animationDelay: '0.3s' }} />
        
        {/* Inner circle */}
        <div className="absolute inset-16 rounded-full bg-foreground/60 animate-kurt-pulse"
             style={{ animationDelay: '0.4s' }} />
        
        {/* Center circle - darkest gray */}
        <div className="absolute inset-20 rounded-full bg-foreground/80 animate-kurt-pulse flex items-center justify-center"
             style={{ animationDelay: '0.5s' }}>
          {isListening && (
            <div className="w-3 h-3 rounded-full bg-background animate-kurt-pulse" />
          )}
        </div>
      </div>

      {/* Status text */}
      <p className="text-lg font-medium text-foreground">
        {isListening ? "Kurt is listening..." : "Kurt"}
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

export default KurtAvatar;
