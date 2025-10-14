import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "@/hooks/use-toast";
import {
  User,
  DollarSign,
  FileText,
  HeadphonesIcon,
  Search,
  ChevronDown,
  Clock,
} from "lucide-react";

// Context Types
export type EntityType = "contractor" | "payroll" | "policy" | "support";

export interface ContextEntity {
  id: string;
  type: EntityType;
  name: string;
  subtitle?: string;
  status: "active" | "draft" | "closed" | "pending";
  avatar?: string;
  lastAccessed?: Date;
}

interface ContextThread {
  entityId: string;
  messages: Array<{ role: string; content: string }>;
  metadata: Record<string, any>;
}

interface ContextPivotState {
  activeEntity: ContextEntity | null;
  threads: Map<string, ContextThread>;
  recentEntities: ContextEntity[];
  setActiveEntity: (entity: ContextEntity) => void;
  getThread: (entityId: string) => ContextThread;
  updateThread: (entityId: string, thread: Partial<ContextThread>) => void;
  addMessage: (entityId: string, role: string, content: string) => void;
}

// Context Provider
const ContextPivotContext = createContext<ContextPivotState | null>(null);

export const useContextPivot = () => {
  const context = useContext(ContextPivotContext);
  if (!context) {
    throw new Error("useContextPivot must be used within ContextPivotProvider");
  }
  return context;
};

export const ContextPivotProvider = ({ children }: { children: ReactNode }) => {
  const [activeEntity, setActiveEntityState] = useState<ContextEntity | null>(null);
  const [threads, setThreads] = useState<Map<string, ContextThread>>(new Map());
  const [recentEntities, setRecentEntities] = useState<ContextEntity[]>([]);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem("context-pivot-state");
    if (saved) {
      const data = JSON.parse(saved);
      setActiveEntityState(data.activeEntity);
      setThreads(new Map(data.threads));
      setRecentEntities(data.recentEntities);
    }
  }, []);

  const setActiveEntity = (entity: ContextEntity) => {
    setActiveEntityState(entity);
    
    // Update recent entities
    setRecentEntities((prev) => {
      const filtered = prev.filter((e) => e.id !== entity.id);
      const updated = [{ ...entity, lastAccessed: new Date() }, ...filtered].slice(0, 5);
      return updated;
    });

    // Save to localStorage
    const state = {
      activeEntity: entity,
      threads: Array.from(threads.entries()),
      recentEntities: [entity, ...recentEntities.filter((e) => e.id !== entity.id)].slice(0, 5),
    };
    localStorage.setItem("context-pivot-state", JSON.stringify(state));
  };

  const getThread = (entityId: string): ContextThread => {
    return threads.get(entityId) || { entityId, messages: [], metadata: {} };
  };

  const updateThread = (entityId: string, threadUpdate: Partial<ContextThread>) => {
    setThreads((prev) => {
      const current = prev.get(entityId) || { entityId, messages: [], metadata: {} };
      const updated = new Map(prev);
      updated.set(entityId, { ...current, ...threadUpdate });
      return updated;
    });
  };

  const addMessage = (entityId: string, role: string, content: string) => {
    const thread = getThread(entityId);
    updateThread(entityId, {
      messages: [...thread.messages, { role, content }],
    });
  };

  return (
    <ContextPivotContext.Provider
      value={{
        activeEntity,
        threads,
        recentEntities,
        setActiveEntity,
        getThread,
        updateThread,
        addMessage,
      }}
    >
      {children}
    </ContextPivotContext.Provider>
  );
};

// Context Chip Component
export const ContextChip = ({ onClick }: { onClick: () => void }) => {
  const { activeEntity } = useContextPivot();

  if (!activeEntity) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="gap-2"
      >
        <User className="h-4 w-4" />
        Select Context
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    );
  }

  const Icon = getEntityIcon(activeEntity.type);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onClick}
            className="gap-2 max-w-[250px]"
          >
            <Icon className="h-4 w-4" />
            <div className="flex flex-col items-start gap-0.5 min-w-0">
              <span className="text-xs font-medium truncate">{activeEntity.name}</span>
              {activeEntity.subtitle && (
                <span className="text-[10px] text-muted-foreground truncate">
                  {activeEntity.subtitle}
                </span>
              )}
            </div>
            <Badge variant={getStatusVariant(activeEntity.status)} className="text-[10px] px-1.5 py-0">
              {activeEntity.status}
            </Badge>
            <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Current context: {activeEntity.name}</p>
          <p className="text-xs text-muted-foreground">Click to switch</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Context Switcher Modal
export const ContextSwitcher = ({
  open,
  onOpenChange,
  entities,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entities: ContextEntity[];
}) => {
  const { activeEntity, setActiveEntity, recentEntities } = useContextPivot();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<EntityType>("contractor");

  const filteredEntities = entities.filter((entity) => {
    const matchesSearch = entity.name.toLowerCase().includes(search.toLowerCase());
    const matchesTab = entity.type === activeTab;
    return matchesSearch && matchesTab;
  });

  const handleSelectEntity = (entity: ContextEntity) => {
    setActiveEntity(entity);
    onOpenChange(false);
    toast({
      title: "Context switched",
      description: `Now viewing ${entity.name}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Switch Context</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Recent Entities */}
          {recentEntities.length > 0 && !search && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Recently Accessed</span>
              </div>
              <div className="space-y-1">
                {recentEntities.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    isActive={activeEntity?.id === entity.id}
                    onClick={() => handleSelectEntity(entity)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contractor">
                <User className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="payroll">
                <DollarSign className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="policy">
                <FileText className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="support">
                <HeadphonesIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[300px] overflow-y-auto space-y-1">
              {filteredEntities.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No {activeTab}s found
                </div>
              ) : (
                filteredEntities.map((entity) => (
                  <EntityCard
                    key={entity.id}
                    entity={entity}
                    isActive={activeEntity?.id === entity.id}
                    onClick={() => handleSelectEntity(entity)}
                  />
                ))
              )}
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Entity Card Component
const EntityCard = ({
  entity,
  isActive,
  onClick,
}: {
  entity: ContextEntity;
  isActive: boolean;
  onClick: () => void;
}) => {
  const Icon = getEntityIcon(entity.type);

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
        isActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent"
      }`}
    >
      <Avatar className="h-10 w-10">
        <AvatarFallback>
          <Icon className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 text-left min-w-0">
        <div className="font-medium text-sm truncate">{entity.name}</div>
        {entity.subtitle && (
          <div className="text-xs text-muted-foreground truncate">{entity.subtitle}</div>
        )}
      </div>

      <Badge variant={getStatusVariant(entity.status)} className="text-[10px]">
        {entity.status}
      </Badge>
    </button>
  );
};

// Context Transition Animation
export const ContextTransition = ({ children }: { children: ReactNode }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Helper Functions
const getEntityIcon = (type: EntityType) => {
  switch (type) {
    case "contractor":
      return User;
    case "payroll":
      return DollarSign;
    case "policy":
      return FileText;
    case "support":
      return HeadphonesIcon;
  }
};

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "active":
      return "default";
    case "draft":
      return "secondary";
    case "closed":
      return "outline";
    case "pending":
      return "secondary";
    default:
      return "default";
  }
};
