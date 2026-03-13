/**
 * InvoiceTemplate - Universal EOR invoice template
 * 
 * Two modes:
 * 1. "company" — Invoice from a limited company (e.g. JLOUW CONSULTANCY LIMITED)
 * 2. "individual" — Invoice from a contractor person, showing their employer logo + initials
 * 
 * Mirrors the PayslipTemplate structure for consistency.
 */

import React from "react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import frontedLogo from "@/assets/fronted-logo.png";

// ─── Types ───────────────────────────────────────────────────────────

export interface InvoiceParty {
  name: string;
  address: string;
  country: string;
  registrationLabel?: string;
  registrationId?: string;
  email?: string;
}

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  total: number;
}

export interface InvoicePaymentDetails {
  bankName: string;
  accountHolder: string;
  accountNumber?: string;
  sortCode?: string;
  iban?: string;
  bic?: string;
}

export interface InvoiceData {
  /** "company" = from a limited company, "individual" = from a contractor person */
  invoiceType: "company" | "individual";
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  currencySymbol: string;

  /** Who is sending the invoice */
  from: InvoiceParty;
  /** Who is being billed */
  billedTo: InvoiceParty;

  /** For "individual" type: the company the contractor works for */
  contractorCompany?: {
    name: string;
    logoUrl?: string;
  };

  lineItems: InvoiceLineItem[];
  subtotal: number;
  tax?: number;
  taxLabel?: string;
  total: number;

  paymentDetails: InvoicePaymentDetails;
  paymentReference: string;
  notes?: string;
  confidential?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────

const fmt = (amount: number, symbol: string) =>
  `${symbol}${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

// ─── Sub-components ──────────────────────────────────────────────────

/** Top letterhead: logo left, invoice meta right */
const Letterhead: React.FC<{
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  contractorName?: string;
  isIndividual?: boolean;
}> = ({ invoiceNumber, invoiceDate, dueDate, contractorName, isIndividual }) => (
  <div className="flex items-start justify-between pb-4">
    <div className="flex items-center gap-2.5">
      <img src={frontedLogo} alt="Fronted" className="h-6 w-auto" />
      {isIndividual && contractorName && (
        <>
          <div className="h-5 w-px bg-border/60" />
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[9px] font-bold bg-primary/10 text-primary">
              {getInitials(contractorName)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] font-medium text-muted-foreground">{contractorName}</span>
        </>
      )}
      {!isIndividual && (
        <div className="ml-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
            Invoice
          </p>
        </div>
      )}
      {isIndividual && (
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
          · Invoice
        </p>
      )}
    </div>
    <div className="text-right space-y-1">
      <div className="flex items-center justify-end gap-6">
        <div>
          <p className="text-[9px] text-muted-foreground uppercase font-medium">Invoice No.</p>
          <p className="text-sm font-bold text-foreground">{invoiceNumber}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase font-medium">Date</p>
          <p className="text-[11px] font-medium text-foreground">{invoiceDate}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground uppercase font-medium">Due</p>
          <p className="text-[11px] font-medium text-foreground">{dueDate}</p>
        </div>
      </div>
    </div>
  </div>
);

/** Party info block */
const PartyBlock: React.FC<{ title: string; party: InvoiceParty }> = ({ title, party }) => (
  <div>
    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pb-1 border-b border-border/40">
      {title}
    </h4>
    <div className="space-y-0.5 mt-1.5">
      <p className="text-[11px] font-semibold text-foreground">{party.name}</p>
      {party.address.split("\n").map((line, i) => (
        <p key={i} className="text-[11px] text-muted-foreground">{line}</p>
      ))}
      <p className="text-[11px] text-muted-foreground">{party.country}</p>
      {party.email && <p className="text-[11px] text-muted-foreground">{party.email}</p>}
      {party.registrationLabel && party.registrationId && (
        <p className="text-[11px] text-muted-foreground mt-1">
          {party.registrationLabel}: <span className="font-medium text-foreground">{party.registrationId}</span>
        </p>
      )}
    </div>
  </div>
);

/** Contractor identity block: shows company logo + contractor initials */
const ContractorIdentity: React.FC<{
  contractorName: string;
  companyName?: string;
  companyLogoUrl?: string;
}> = ({ contractorName, companyName, companyLogoUrl }) => (
  <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
    {companyLogoUrl ? (
      <img src={companyLogoUrl} alt={companyName} className="h-8 w-8 rounded object-contain" />
    ) : companyName ? (
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
          {getInitials(companyName)}
        </AvatarFallback>
      </Avatar>
    ) : null}
    <div className="flex-1 min-w-0">
      {companyName && (
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Contracting for</p>
      )}
      {companyName && (
        <p className="text-[11px] font-semibold text-foreground">{companyName}</p>
      )}
    </div>
    <Avatar className="h-8 w-8">
      <AvatarFallback className="text-[10px] font-bold bg-accent text-accent-foreground">
        {getInitials(contractorName)}
      </AvatarFallback>
    </Avatar>
  </div>
);

/** Single key-value row */
const InfoRow: React.FC<{ label: string; value: string; bold?: boolean }> = ({ label, value, bold }) => (
  <div className="flex justify-between py-[3px]">
    <span className="text-[11px] text-muted-foreground">{label}</span>
    <span className={`text-[11px] tabular-nums ${bold ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{value}</span>
  </div>
);

// ─── Main Template ───────────────────────────────────────────────────

export const InvoiceTemplate: React.FC<{ data: InvoiceData }> = ({ data }) => {
  const sym = data.currencySymbol;

  return (
    <div className="space-y-5 text-foreground">
      {/* ── Letterhead ── */}
      <Letterhead
        invoiceNumber={data.invoiceNumber}
        invoiceDate={data.invoiceDate}
        dueDate={data.dueDate}
      />

      <Separator className="bg-border/50" />

      {/* ── Contractor identity (individual mode) ── */}
      {data.invoiceType === "individual" && data.contractorCompany && (
        <ContractorIdentity
          contractorName={data.from.name}
          companyName={data.contractorCompany.name}
          companyLogoUrl={data.contractorCompany.logoUrl}
        />
      )}

      {/* ── From + Billed To — two columns ── */}
      <div className="grid grid-cols-2 gap-8">
        <PartyBlock title={data.invoiceType === "company" ? "From" : "Contractor"} party={data.from} />
        <PartyBlock title="Billed To" party={data.billedTo} />
      </div>

      <Separator className="bg-border/50" />

      {/* ── Invoice Description ── */}
      <div className="space-y-1.5">
        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Line Items</h4>
        <div className="rounded-lg border border-border/50 overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[1fr_50px_90px_90px] px-3 py-1.5 bg-muted/40 text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
            <span>Description</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit Price</span>
            <span className="text-right">Total</span>
          </div>
          {data.lineItems.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-[1fr_50px_90px_90px] px-3 py-2 border-t border-border/30"
            >
              <span className="text-[11px] text-muted-foreground">{item.description}</span>
              <span className="text-[11px] text-right tabular-nums text-muted-foreground">{item.qty}</span>
              <span className="text-[11px] text-right tabular-nums font-medium text-foreground">{fmt(item.unitPrice, sym)}</span>
              <span className="text-[11px] text-right tabular-nums font-medium text-foreground">{fmt(item.total, sym)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Totals ── */}
      <div className="flex justify-end">
        <div className="w-64 space-y-0">
          <InfoRow label="Subtotal" value={fmt(data.subtotal, sym)} />
          {data.tax !== undefined && data.tax > 0 && (
            <InfoRow label={data.taxLabel || "Tax"} value={fmt(data.tax, sym)} />
          )}
          <Separator className="bg-border/50 my-1" />
          <div className="flex justify-between py-1">
            <span className="text-xs font-semibold text-foreground">Total</span>
            <span className="text-xs font-bold text-foreground tabular-nums">{fmt(data.total, sym)}</span>
          </div>
        </div>
      </div>

      {/* ── Total highlight ── */}
      <div className="flex items-center justify-between p-3.5 rounded-lg bg-primary/5 border border-primary/20">
        <span className="text-sm font-semibold text-foreground">Amount Due</span>
        <span className="text-xl font-bold text-primary tabular-nums">{fmt(data.total, sym)}</span>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Payment Details ── */}
      <div className="space-y-1.5">
        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 pb-1 border-b border-border/40">
          Payment Details
        </h4>
        <div className="grid grid-cols-2 gap-x-8 gap-y-0">
          <InfoRow label="Bank Name" value={data.paymentDetails.bankName} />
          <InfoRow label="Account Holder" value={data.paymentDetails.accountHolder} />
          {data.paymentDetails.accountNumber && (
            <InfoRow label="Account Number" value={data.paymentDetails.accountNumber} />
          )}
          {data.paymentDetails.sortCode && (
            <InfoRow label="Sort Code" value={data.paymentDetails.sortCode} />
          )}
          {data.paymentDetails.iban && (
            <InfoRow label="IBAN" value={data.paymentDetails.iban} />
          )}
          {data.paymentDetails.bic && (
            <InfoRow label="BIC" value={data.paymentDetails.bic} />
          )}
          <InfoRow label="Payment Reference" value={data.paymentReference} bold />
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Due date reminder ── */}
      <div className="text-center py-2">
        <p className="text-[11px] font-medium text-muted-foreground">
          {fmt(data.total, sym)} due by <span className="font-semibold text-foreground">{data.dueDate}</span>
        </p>
      </div>

      <Separator className="bg-border/50" />

      {/* ── Footer ── */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="space-y-0.5">
          <p>Invoice: {data.invoiceNumber}</p>
          {data.notes && <p>{data.notes}</p>}
        </div>
        <div className="text-right space-y-0.5">
          <p className="font-medium">Powered by Fronted</p>
          {data.confidential !== false && (
            <p className="italic">Confidential — for intended recipient only</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
