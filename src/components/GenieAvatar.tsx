import { Mic, MessageSquare } from "lucide-react";

interface GenieAvatarProps {
  isListening?: boolean;
  message?: string;
}

const GenieAvatar = ({ isListening = false, message = "Hi! Let's get you set up." }: GenieAvatarProps) => {
  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Genie Avatar */}
      <div className="relative">
        {/* Outer glow ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-genie opacity-20 blur-2xl animate-genie-pulse" />
        
        {/* Main avatar container */}
        <div className="relative h-32 w-32 rounded-full bg-gradient-genie flex items-center justify-center genie-glow">
          {/* Inner pulse circle */}
          <div className={`h-24 w-24 rounded-full bg-white/30 flex items-center justify-center ${isListening ? 'animate-genie-pulse' : ''}`}>
            {isListening ? (
              <Mic className="h-12 w-12 text-white" />
            ) : (
              <MessageSquare className="h-12 w-12 text-white" />
            )}
          </div>
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
