import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Briefcase, Mail, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkerProfileShellProps {
  name: string;
  email: string;
  role: string;
  location: string;
  status: "awaiting_contract" | "contract_signed" | "onboarding" | "active";
  startDate?: string;
  avatarUrl?: string;
  className?: string;
}

const statusConfig = {
  awaiting_contract: { label: "Awaiting Contract", color: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
  contract_signed: { label: "Contract Signed", color: "bg-green-500/10 text-green-700 dark:text-green-400" },
  onboarding: { label: "Onboarding", color: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
  active: { label: "Active", color: "bg-primary/10 text-primary" },
};

export const WorkerProfileShell: React.FC<WorkerProfileShellProps> = ({
  name,
  email,
  role,
  location,
  status,
  startDate,
  avatarUrl,
  className,
}) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} alt={name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{name}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {role}
              </p>
            </div>
          </div>
          <Badge className={cn("capitalize", statusConfig[status].color)} variant="outline">
            {statusConfig[status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        {startDate && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Start Date: {startDate}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
