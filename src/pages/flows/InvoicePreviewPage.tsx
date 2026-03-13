/**
 * Shared – Invoice Template Preview
 * 
 * Standalone page to preview the universal EOR invoice template
 * with two modes: Company and Individual contractor.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download } from "lucide-react";
import frontedLogo from "@/assets/fronted-logo.png";
import { InvoiceTemplate, type InvoiceData } from "@/components/shared/InvoiceTemplate";
import { toast } from "sonner";

const sampleInvoices: Record<string, InvoiceData> = {
  company: {
    invoiceType: "company",
    invoiceNumber: "INVOICE-020",
    invoiceDate: "09 Mar 2026",
    dueDate: "31 Mar 2026",
    currency: "EUR",
    currencySymbol: "€",
    from: {
      name: "JLOUW CONSULTANCY LIMITED",
      address: "25 Riverdale Gardens\nTwickenham\nTW1 2BX",
      country: "United Kingdom",
      email: "jacqueslouw17@gmail.com",
      registrationLabel: "Company no",
      registrationId: "16200888",
    },
    billedTo: {
      name: "ORIZON AS",
      address: "Bryggegata 24\nMANDAL\n4514",
      country: "Norway",
      email: "peter@opkas.no",
    },
    lineItems: [
      { description: "Pawan JBOX Salary", qty: 1, unitPrice: 1700.00, total: 1700.00 },
    ],
    subtotal: 1700.00,
    total: 1700.00,
    paymentDetails: {
      bankName: "Monzo",
      accountHolder: "JLOUW CONSULTANCY LIMITED",
      accountNumber: "43756103",
      sortCode: "04-00-03",
      bic: "MONZGB2L",
      iban: "GB19 MONZ 0400 0343 7561 03",
    },
    paymentReference: "INVOICE-020",
    confidential: true,
  },
  individual: {
    invoiceType: "individual",
    invoiceNumber: "INV-2026-0047",
    invoiceDate: "01 Mar 2026",
    dueDate: "15 Mar 2026",
    currency: "EUR",
    currencySymbol: "€",
    from: {
      name: "Sofia Martinez",
      address: "Calle de Alcalá 45, 3B\nMadrid\n28014",
      country: "Spain",
      email: "sofia.martinez@email.com",
    },
    billedTo: {
      name: "Fronted Denmark ApS",
      address: "Lyskær 3\nHerlev\n2730",
      country: "Denmark",
      registrationLabel: "CVR no.",
      registrationId: "46182596",
    },
    contractorCompany: {
      name: "TechFlow Solutions",
    },
    lineItems: [
      { description: "Frontend Development – March 2026", qty: 1, unitPrice: 4500.00, total: 4500.00 },
      { description: "Code Review & QA Support", qty: 1, unitPrice: 800.00, total: 800.00 },
    ],
    subtotal: 5300.00,
    tax: 1113.00,
    taxLabel: "IVA (21%)",
    total: 6413.00,
    paymentDetails: {
      bankName: "CaixaBank",
      accountHolder: "Sofia Martinez",
      iban: "ES91 2100 0418 4502 0005 1332",
      bic: "CAIXESBBXXX",
    },
    paymentReference: "INV-2026-0047",
    notes: "Services rendered as independent contractor",
    confidential: true,
  },
};

const InvoicePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("company");
  const data = sampleInvoices[selectedType];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/?tab=flows")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <img src={frontedLogo} alt="Fronted" className="h-5 w-auto" />
            <div className="h-4 w-px bg-border/60" />
            <span className="text-sm font-medium text-muted-foreground">Invoice Template</span>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="company">🏢 Limited Company</SelectItem>
                <SelectItem value="individual">👤 Individual Contractor</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Invoice PDF downloaded")}>
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-card border border-border/50 rounded-xl p-8 shadow-sm">
          <InvoiceTemplate data={data} />
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-6">
          This is a sample invoice generated for preview purposes. Actual invoices are generated per billing cycle.
        </p>
      </div>
    </div>
  );
};

export default InvoicePreviewPage;
