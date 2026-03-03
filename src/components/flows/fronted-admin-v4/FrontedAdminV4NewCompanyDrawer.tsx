/**
 * Flow 1 – Fronted Admin Dashboard v4 New Company Drawer
 * 
 * v4-specific drawer for adding a new company. Does not reuse any components
 * from other flows to maintain complete isolation.
 */

import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface FrontedAdminV4NewCompanyDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompanyCreated: (company: { id: string; name: string; country: string }) => void;
}

const COUNTRIES = [
  // Nordic
  { code: "NO", name: "🇳🇴 Norway" },
  { code: "DK", name: "🇩🇰 Denmark" },
  { code: "SE", name: "🇸🇪 Sweden" },
  { code: "FI", name: "🇫🇮 Finland" },
  { code: "IS", name: "🇮🇸 Iceland" },
  // Europe
  { code: "GB", name: "🇬🇧 United Kingdom" },
  { code: "DE", name: "🇩🇪 Germany" },
  { code: "FR", name: "🇫🇷 France" },
  { code: "NL", name: "🇳🇱 Netherlands" },
  { code: "BE", name: "🇧🇪 Belgium" },
  { code: "IE", name: "🇮🇪 Ireland" },
  { code: "ES", name: "🇪🇸 Spain" },
  { code: "PT", name: "🇵🇹 Portugal" },
  { code: "IT", name: "🇮🇹 Italy" },
  { code: "CH", name: "🇨🇭 Switzerland" },
  { code: "AT", name: "🇦🇹 Austria" },
  { code: "PL", name: "🇵🇱 Poland" },
  { code: "XK", name: "🇽🇰 Kosovo" },
  // Americas
  { code: "US", name: "🇺🇸 United States" },
  { code: "CA", name: "🇨🇦 Canada" },
  { code: "MX", name: "🇲🇽 Mexico" },
  { code: "BR", name: "🇧🇷 Brazil" },
  // Asia & Pacific
  { code: "IN", name: "🇮🇳 India" },
  { code: "PH", name: "🇵🇭 Philippines" },
  { code: "SG", name: "🇸🇬 Singapore" },
  { code: "AU", name: "🇦🇺 Australia" },
  { code: "NZ", name: "🇳🇿 New Zealand" },
  { code: "JP", name: "🇯🇵 Japan" },
  { code: "KR", name: "🇰🇷 South Korea" },
  // Middle East & Africa
  { code: "AE", name: "🇦🇪 United Arab Emirates" },
  { code: "ZA", name: "🇿🇦 South Africa" },
  { code: "IL", name: "🇮🇱 Israel" },
];


export const FrontedAdminV4NewCompanyDrawer: React.FC<FrontedAdminV4NewCompanyDrawerProps> = ({
  open,
  onOpenChange,
  onCompanyCreated,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!companyName.trim()) {
      toast.error("Company name is required");
      return;
    }
    if (!country) {
      toast.error("Country is required");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newCompany = {
      id: `company-${Date.now()}`,
      name: companyName.trim(),
      country,
    };

    onCompanyCreated(newCompany);

    // Reset form
    setCompanyName("");
    setCountry("");
    setIsSubmitting(false);
    onOpenChange(false);

    toast.success(`${newCompany.name} has been added successfully`);
  };

  const handleCancel = () => {
    setCompanyName("");
    setCountry("");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Add New Company</SheetTitle>
        </SheetHeader>

        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company-name">Company Name *</Label>
            <Input
              id="company-name"
              placeholder="Enter company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Primary Legal Entity Country *</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50 max-h-[280px]">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Where the company is legally registered. Additional entities can be added later.
            </p>
          </div>

        </div>

        <SheetFooter className="flex gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Company"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default FrontedAdminV4NewCompanyDrawer;
