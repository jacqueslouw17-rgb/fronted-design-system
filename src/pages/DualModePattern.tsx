import { useState } from "react";
import { ArrowLeft, MessageSquare, FileText, Mic, Send, Check, AlertCircle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import KurtAvatar from "@/components/KurtAvatar";

interface ContractData {
  contractorName: string;
  country: string;
  startDate: string;
  hourlyRate: string;
  currency: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type SyncStatus = "synced" | "pending" | "conflict";

const DualModePattern = () => {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"chat" | "manual">("chat");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [voiceMode, setVoiceMode] = useState(false);
  const [chatInput, setChatInput] = useState("");
  
  const [contractData, setContractData] = useState<ContractData>({
    contractorName: "",
    country: "",
    startDate: "",
    hourlyRate: "",
    currency: "USD"
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! I can help you draft a contract. Just tell me the contractor's name and country, and I'll get started."
    }
  ]);

  const getSyncBadgeVariant = (status: SyncStatus) => {
    switch (status) {
      case "synced": return "default";
      case "pending": return "secondary";
      case "conflict": return "destructive";
    }
  };

  const getSyncIcon = (status: SyncStatus) => {
    switch (status) {
      case "synced": return <Check className="h-3 w-3" />;
      case "pending": return <AlertCircle className="h-3 w-3" />;
      case "conflict": return <AlertCircle className="h-3 w-3" />;
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setChatInput("");

    // Simulate Genie processing and auto-filling form
    setTimeout(() => {
      let response = "";
      let updatedData = { ...contractData };

      // Simple pattern matching for demo
      if (userMessage.toLowerCase().includes("jacques") && userMessage.toLowerCase().includes("norway")) {
        updatedData = {
          contractorName: "Jacques Dubois",
          country: "Norway",
          startDate: "2024-11-01",
          hourlyRate: "85",
          currency: "USD"
        };
        response = "I've pre-filled this contract using your Norway template. Contractor: Jacques Dubois, Start Date: Nov 1, 2024, Rate: $85/hr. You can review the details in the Manual tab or let me know if you want to adjust anything.";
      } else if (userMessage.toLowerCase().includes("rate")) {
        const rateMatch = userMessage.match(/\$?(\d+)/);
        if (rateMatch) {
          updatedData.hourlyRate = rateMatch[1];
          response = `Got it — new hourly rate of $${rateMatch[1]} saved and synced to your contract form.`;
        } else {
          response = "What hourly rate would you like to set?";
        }
      } else if (userMessage.toLowerCase().includes("start") || userMessage.toLowerCase().includes("date")) {
        response = "What start date should I use for the contract?";
      } else {
        response = "I can help you with that. Could you provide the contractor's name and country?";
      }

      setContractData(updatedData);
      setMessages(prev => [...prev, { role: "assistant", content: response }]);
      setSyncStatus("synced");
      
      toast({
        title: "Form synced",
        description: "Chat updates applied to manual form",
      });
    }, 1000);
  };

  const handleManualEdit = (field: keyof ContractData, value: string) => {
    setContractData(prev => ({ ...prev, [field]: value }));
    setSyncStatus("pending");

    // Simulate sync delay
    setTimeout(() => {
      setSyncStatus("synced");
      
      const fieldLabels: Record<keyof ContractData, string> = {
        contractorName: "contractor name",
        country: "country",
        startDate: "start date",
        hourlyRate: "hourly rate",
        currency: "currency"
      };

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I see you've updated the ${fieldLabels[field]} to "${value}" — contract data synced.`
        }
      ]);

      toast({
        title: "Changes synced",
        description: "Genie has been notified of your manual updates",
      });
    }, 800);
  };

  const handleModeSwitch = (mode: "chat" | "manual") => {
    setActiveMode(mode);
    
    if (mode === "manual" && contractData.contractorName) {
      toast({
        title: "Switched to Manual",
        description: "Your chat progress has been loaded into the form",
      });
    } else if (mode === "chat" && contractData.contractorName) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `I see you've been working on the contract for ${contractData.contractorName}. Need any help finishing it up?`
        }
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-8 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </Link>
        </div>
        <div className="container mx-auto px-8 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Dual Mode Pattern
              </h1>
              <p className="text-muted-foreground mt-1">
                Complete tasks via chat or manual UI — seamlessly synced
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={getSyncBadgeVariant(syncStatus)} className="gap-1">
                {getSyncIcon(syncStatus)}
                {syncStatus === "synced" && "Synced"}
                {syncStatus === "pending" && "Syncing..."}
                {syncStatus === "conflict" && "Conflict"}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-8 py-6">
        <Tabs value={activeMode} onValueChange={(v) => handleModeSwitch(v as "chat" | "manual")}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="chat" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Chat Mode
            </TabsTrigger>
            <TabsTrigger value="manual" className="gap-2">
              <FileText className="h-4 w-4" />
              Manual Mode
            </TabsTrigger>
          </TabsList>

          {/* Chat Mode */}
          <TabsContent value="chat" className="space-y-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Chat Panel */}
              <Card className="flex flex-col h-[600px]">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Genie Assistant</h3>
                    <Button
                      variant={voiceMode ? "default" : "ghost"}
                      size="icon"
                      onClick={() => setVoiceMode(!voiceMode)}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${
                          msg.role === "user" ? "flex-row-reverse" : ""
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <div className="w-8 h-8 flex-shrink-0">
                            <KurtAvatar isListening={false} message="" size="sm" />
                          </div>
                        ) : (
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-foreground/10 text-foreground text-xs">
                              U
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-lg p-3 max-w-[80%] ${
                            msg.role === "user"
                              ? "bg-foreground/10"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask Genie to draft a contract..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Try: "Draft a contract for Jacques in Norway"
                  </p>
                </div>
              </Card>

              {/* Live Preview */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Live Contract Preview</h3>
                </div>
                <Separator className="mb-4" />
                
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Contractor Name</Label>
                    <p className="text-sm font-medium">
                      {contractData.contractorName || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <p className="text-sm font-medium">
                      {contractData.country || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Start Date</Label>
                    <p className="text-sm font-medium">
                      {contractData.startDate || "—"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Hourly Rate</Label>
                    <p className="text-sm font-medium">
                      {contractData.hourlyRate 
                        ? `${contractData.currency} ${contractData.hourlyRate}/hr` 
                        : "—"}
                    </p>
                  </div>
                </div>

                {contractData.contractorName && (
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      Switch to Manual Mode to edit details directly
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => handleModeSwitch("manual")}
                    >
                      Open Manual Editor
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          {/* Manual Mode */}
          <TabsContent value="manual" className="space-y-0">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Manual Form */}
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Contract Form</h3>
                </div>
                <Separator className="mb-6" />
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Contractor Name</Label>
                    <Input
                      id="name"
                      value={contractData.contractorName}
                      onChange={(e) => handleManualEdit("contractorName", e.target.value)}
                      placeholder="Enter contractor name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={contractData.country}
                      onChange={(e) => handleManualEdit("country", e.target.value)}
                      placeholder="Enter country"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => handleManualEdit("startDate", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Hourly Rate</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rate"
                        type="number"
                        value={contractData.hourlyRate}
                        onChange={(e) => handleManualEdit("hourlyRate", e.target.value)}
                        placeholder="0.00"
                        className="flex-1"
                      />
                      <Input
                        value={contractData.currency}
                        onChange={(e) => handleManualEdit("currency", e.target.value)}
                        className="w-24"
                        placeholder="USD"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    Need help? Switch to Chat Mode and ask Genie.
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleModeSwitch("chat")}
                  >
                    Ask Genie for Help
                  </Button>
                </div>
              </Card>

              {/* Genie Summary */}
              <Card className="p-6 bg-muted/30">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Genie Context</h3>
                </div>
                <Separator className="mb-4" />

                <ScrollArea className="h-[400px]">
                  <div className="space-y-3 pr-4">
                    {messages.filter(m => m.role === "assistant").slice(-3).map((msg, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="w-6 h-6 flex-shrink-0 mt-1">
                          <KurtAvatar isListening={false} message="" size="sm" />
                        </div>
                        <div className="flex-1 bg-card rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Genie says:</p>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>All changes are auto-synced with Genie</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DualModePattern;
