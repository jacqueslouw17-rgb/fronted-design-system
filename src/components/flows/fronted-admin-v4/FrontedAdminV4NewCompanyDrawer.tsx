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
  onCompanyCreated: (company: { id: string; name: string; country: string; currency: string }) => void;
}

const COUNTRIES = [
  { code: "PH", name: "Philippines" },
  { code: "SG", name: "Singapore" },
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "NO", name: "Norway" },
  { code: "MX", name: "Mexico" },
  { code: "PT", name: "Portugal" },
  { code: "IT", name: "Italy" },
  { code: "JP", name: "Japan" },
  { code: "AU", name: "Australia" },
];

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "PHP", name: "Philippine Peso" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "MXN", name: "Mexican Peso" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
];

export const FrontedAdminV4NewCompanyDrawer: React.FC<FrontedAdminV4NewCompanyDrawerProps> = ({
  open,
  onOpenChange,
  onCompanyCreated,
}) => {
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
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
    if (!currency) {
      toast.error("Currency is required");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const newCompany = {
      id: `company-${Date.now()}`,
      name: companyName.trim(),
      country,
      currency,
    };

    onCompanyCreated(newCompany);

    // Reset form
    setCompanyName("");
    setCountry("");
    setCurrency("");
    setIsSubmitting(false);
    onOpenChange(false);

    toast.success(`${newCompany.name} has been added successfully`);
  };

  const handleCancel = () => {
    setCompanyName("");
    setCountry("");
    setCurrency("");
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
            <Label htmlFor="country">Country / Region *</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Payroll Currency *</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-background z-50">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} – {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
