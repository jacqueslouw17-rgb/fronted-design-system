import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CertifiedActionDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor: {
    id: string;
    name: string;
    country: string;
    countryFlag: string;
    role: string;
    salary: string;
  } | null;
  onConfirm: () => void;
}

const checklist = [
  { id: 1, label: "Contract signed", completed: true },
  { id: 2, label: "KYC pass", completed: true },
  { id: 3, label: "Bank details verified", completed: true },
  { id: 4, label: "Tax profile set", completed: true },
];

export function CertifiedActionDrawer({ open, onOpenChange, contractor, onConfirm }: CertifiedActionDrawerProps) {
  if (!contractor) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-semibold">Prepare for Payroll</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Summary Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Summary</h3>
            <div className="space-y-2 bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Contractor</span>
                <span className="text-sm font-medium">{contractor.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Country</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{contractor.countryFlag}</span>
                  <span className="text-sm font-medium">{contractor.country}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Role</span>
                <span className="text-sm font-medium">{contractor.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Compensation</span>
                <span className="text-sm font-medium">{contractor.salary}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Bank Method</span>
                <span className="text-sm font-medium">Direct Transfer</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Checklist Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Verification Checklist</h3>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-md bg-muted/30"
                >
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full ${
                    item.completed ? "bg-green-500/20" : "bg-muted"
                  }`}>
                    {item.completed ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <X className="w-3 h-3 text-muted-foreground" />
                    )}
                  </div>
                  <span className="text-sm">{item.label}</span>
                  {item.completed && (
                    <Badge variant="outline" className="ml-auto text-[10px] bg-green-500/10 text-green-700 border-green-500/20">
                      Verified
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Info Note */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              Marking this contractor as payroll ready will allow them to be added to upcoming payroll batches.
            </p>
          </div>
        </div>

        <SheetFooter className="mt-6 flex-row gap-2">
          <SheetClose asChild>
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
          </SheetClose>
          <Button onClick={handleConfirm} className="flex-1">
            Mark as Payroll Ready
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
