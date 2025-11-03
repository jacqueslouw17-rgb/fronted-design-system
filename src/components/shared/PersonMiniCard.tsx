import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface PersonMiniCardProps {
  name: string;
  role?: string;
  email?: string;
  avatar?: string;
  countryCode?: string;
  countryFlag?: string;
  status?: string;
  statusVariant?: "default" | "secondary" | "destructive" | "outline" | "accent" | "primary";
  onSelect?: (selected: boolean) => void;
  isSelected?: boolean;
  showCheckbox?: boolean;
  onClick?: () => void;
  className?: string;
}

const PersonMiniCard = ({
  name,
  role,
  email,
  avatar,
  countryCode,
  countryFlag,
  status,
  statusVariant = "outline",
  onSelect,
  isSelected = false,
  showCheckbox = false,
  onClick,
  className = ""
}: PersonMiniCardProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card 
      className={`p-3 cursor-pointer hover:shadow-md transition-all duration-200 ${isSelected ? 'border-primary shadow-md' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        {showCheckbox && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
          </Avatar>
          {countryFlag && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border border-border flex items-center justify-center text-xs">
              {countryFlag}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm truncate">{name}</p>
            {status && (
              <Badge variant={statusVariant} className="text-xs">
                {status}
              </Badge>
            )}
          </div>
          {role && <p className="text-xs text-muted-foreground truncate">{role}</p>}
          {email && <p className="text-xs text-muted-foreground truncate">{email}</p>}
        </div>
      </div>
    </Card>
  );
};

export default PersonMiniCard;
