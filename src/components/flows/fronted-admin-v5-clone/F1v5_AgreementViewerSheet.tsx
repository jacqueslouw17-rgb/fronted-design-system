/**
 * F1v4_AgreementViewerSheet - Read-only agreement viewer overlay
 * 
 * Opens as a wider right-side panel showing the signed agreement
 * for a worker. Supports close via back button or overlay click.
 */

import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, FileText, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DoneWorkerData } from "./F1v5_DoneWorkerDetailDrawer";

interface AgreementViewerSheetProps {
  open: boolean;
  onClose: () => void;
  worker: DoneWorkerData;
  isEmployee: boolean;
}

type AgreementSection = { heading: string; text: string; isSignatureBlock?: boolean };

const getEmploymentAgreement = (worker: DoneWorkerData): AgreementSection[] => [
  { heading: "Employment Agreement", text: "" },
  { heading: "", text: `This employment agreement (the «Employment Agreement») is entered into on the date hereof between:\n\n1. Fronted Sweden AB (NewCo 8634 Sweden AB), reg. no. 559548-9914, with a registered address at Ekensbergsvägen 113 4 Tr, 171 41 Solna, (the «Company» or «Employer»); and\n2. ${worker.name}, born ${worker.startDate || "February 1, 2026"}, with residence at ${worker.country} (the «Employee»)\n\nThe Company and the Employee are jointly referred to as the «Parties» and each is a «Party».` },
  { heading: "Key Terms of the Employment (the \"Terms\"):", text: `A. Job Role: ${worker.role}\nB. Job Description: Annex A\nC. Place of Work: ${worker.country}\nD. Annual Gross Salary: ${worker.salary}\nE. Variable Salary Elements: Addendum B\nF. Start Date: ${worker.startDate || "February 1, 2026"}\nG. Contract Term: Indefinite Employment\nH. Probationary Period: 6 months\nI. Notice Period:\n   a. Employer: Per the Employment Protection Act\n   b. Employee: 3 months\nJ. Employment Status: Full-time\nK. Working Hours: 40 hours per week\nL. Holiday: 25 days\nM. Pension: Public Pension + 4.5% Occupational Pension\nN. Other benefits: Per company policy` },
  { heading: "1. Position and assignments", text: `1.1. The Employee is employed as ${worker.role}, effective from ${worker.startDate || "February 1, 2026"}.\n\n1.2. Unless otherwise defined in (G) and (H), the employment term is indefinite.\n\n1.3. Their work shall be performed in accordance with the framework of the instructions provided by the Company and their clients. The Employee shall perform their duties in accordance with the applicable job description, policies and work rules of the Company and their clients, which may be amended from time to time.\n\n1.4. The Employee shall ensure that the interests of the Company and their clients are safeguarded and promoted in accordance with principles that are ethically and commercially accepted, and in accordance with applicable legislation.\n\n1.5. The Employee shall place their working capacity at the disposal of the Company according to their employment status (J) and working hours (K), and shall, to the extent permissible by law, not engage in other employment that could interfere with obligations that stem from this Agreement.` },
  { heading: "2. Place of work – working hours", text: `2.1. The principal place of work shall be ${worker.country}.\n\n2.2. If the Employee is working remotely from home, the Employee confirms that, as of the date of this agreement, their home office is safe and suitable for the performance of the job duties contemplated under this agreement - and undertakes to notify the Company at any time during the employment if the work environment ceases to be considered fully satisfactory.\n\n2.3. The normal working hours are eight hours a day, totalling forty hours per week, unless otherwise specified in (K). Unless otherwise agreed, the Employee's ordinary working hours are scheduled Monday to Friday during normal office hours.\n\n2.4. The Employee's salary is intended to compensate for all work performed, including reasonable overtime. The Employee is therefore not entitled to separate overtime compensation unless expressly agreed in writing.\n\n2.5. The Employee is not permitted to work outside of the designated country for more than fourteen days at a time, and no more than 30 days per calendar year, without prior written approval by the Company.` },
  { heading: "3. Salary", text: `3.1. The Employee's gross annual salary shall be ${worker.salary}, payable in monthly arrears in accordance with the Company's ordinary payroll practices and subject to statutory deductions. The payroll date of the Company is the 25th of each month, or the business day prior if the 25th of the month is a bank holiday.\n\n3.2. If the compensation plan for the Employee consists of a variable element, such as commission or result-based bonuses (E), this shall be regulated by an addendum.\n\n3.3. Notwithstanding the foregoing, the Company may decide to pay bonuses at the full discretion of the Company. Previously paid discretionary bonuses does not represent a fixed part of the compensation of the Employee, and does not guarantee any future payments of such discretionary bonuses.\n\n3.4. If incorrect salary or bonuses are paid, the Company is entitled to correct such errors in accordance with applicable law, including by set-off where legally permitted.` },
  { heading: "4. Other benefits", text: "4.1. The Employee may be entitled to other benefits according to the Company's applicable policies as may be implemented by the Company from time to time. Any such benefits shall be taxed in accordance with prevailing laws and regulations." },
  { heading: "5. Expenses", text: "5.1. The Company shall cover all pre-approved expenses in connection with business activities in accordance with the Company's applicable expense reimbursement policy." },
  { heading: "6. Pension and insurance", text: `6.1. The Employee is entitled to the statutory public pension in accordance with applicable social security and pension legislation as amended from time to time. The Employer shall make all mandatory employer social security contributions required by law, including those forming the basis for the Employee's statutory public pension. Nothing in this Agreement limits the Employee's rights under mandatory pension legislation.\n\n6.2. In addition to the statutory public pension, the Employee shall be entitled to an occupational pension. The Employer shall, during the term of employment, pay pension contributions corresponding to 4.5% of the Employee's current base salary to an occupational pension arrangement designated by the Employer, in accordance with the terms and conditions of such pension plan.` },
  { heading: "7. Holiday and holiday allowance", text: "7.1. The Employee is entitled to annual holiday in accordance with the applicable Holiday Act." },
  { heading: "8. Sick leave", text: "8.1. In case of absence due to illness, the Employee is entitled to sick pay in accordance with the applicable Sick Pay Act." },
  { heading: "9. Confidentiality", text: "The Employee shall keep confidential all business related and internal information that is not generally known concerning the Company, any group companies and/or any of the Company's clients, vendors, suppliers or other third parties. This confidentiality obligation includes, but is not limited to, trade secrets, business plans/strategies, commercial contract terms such as price structure/rebates, financial information, information regarding customers/suppliers or other employees, including personal data, as well as ideas, concepts, and know-how. The Employee shall not disclose information to other employees of the Company if this is not necessary for such other employees' work. The confidentiality obligations described shall apply both during and after the employment period." },
  { heading: "10. Intellectual Property Rights", text: "The Company shall, free of charge unless otherwise regulated by law, become the owner of all intellectual property created or developed by the Employee in connection with the employment, irrespective of whether these have been created or developed outside working hours, and with or without the Employee's personal equipment or devices." },
  { heading: "11. Termination", text: `Following the expiry of the probationary period (if applicable), termination of employment and notice periods under this Agreement shall comply with the relevant and mandatory provisions of the applicable Employment Protection Act, as amended from time to time.\n\nIf the Employee gives notice of resignation, the Employer is entitled to a notice period of 3 months.` },
  { heading: "12. Probationary period", text: `12.1. The Parties agree that the employment shall commence with a probationary period of six (6) months. During this probationary period, either party may terminate the employment by giving fourteen (14) days' written notice.` },
  { heading: "13. Non-solicitation of Clients", text: "13.1. During the term of employment, and for 12 months after the termination of employment, the Employee is prohibited from contacting clients whom the Employee has had contact with during their employment during the last 12 months, for the purpose of obtaining their business or partnership." },
  { heading: "14. Non-solicitation of Employees", text: "14.1. During the term of employment, and for 12 months after termination of employment, the Employee is prohibited from directly or indirectly influencing or attempting to influence any of the Company's employees or consultants to leave the Company." },
  { heading: "15. Disputes and Governing Law", text: `15.1. This Employment Agreement is signed digitally and governed by ${worker.country} law, including the applicable Employment Protection Act.\n\n15.2. No collective bargaining agreement applies to this employment.` },
  { heading: "Signatures", text: "", isSignatureBlock: true },
];

const getContractorAgreement = (worker: DoneWorkerData): AgreementSection[] => [
  { heading: "Contractor Agreement", text: "" },
  { heading: "", text: `This Contract is between Fronted AS, a Norwegian Company, and ${worker.name}, ${worker.country} (the "Contractor"). Any reference to the "Client" in the following is a reference to Fronted AS. Any reference to "End Client" in the following is a reference to the Client Company.` },
  { heading: "1. WORK AND PAYMENT", text: "" },
  { heading: "1.1 Project.", text: `The Client is contracting the services of the Contractor to do the following: ${worker.role}.` },
  { heading: "1.2 Schedule.", text: `The Contractor will begin performing their services on ${worker.startDate || "February 1, 2026"} and will continue until termination of this Contract. This Contract can be ended by either Client or Contractor at any time, pursuant to the terms of Section 6, Term and Termination.` },
  { heading: "1.3 Payment.", text: `The Client shall pay the Contractor a fixed consultancy fee of ${worker.salary} per month, payable against invoice, for the Services.` },
  { heading: "1.4 Expenses.", text: "The Contractor shall be responsible for all expenses incurred in the performance of the Services, except for any expenses expressly pre-approved in writing by the Client, which shall be reimbursed against valid receipts." },
  { heading: "1.5 Invoices.", text: "The Contractor will invoice Fronted AS. Fronted AS agrees to pay the amount owed at the end of each month of receiving the invoice. Under the condition the invoice is not contested by the End Client." },
  { heading: "2. OWNERSHIP AND LICENSES", text: "" },
  { heading: "2.1 Client Owns All Work Product.", text: "As part of this consultancy, the Contractor is creating a \"work product\" for the Client. The Contractor hereby gives the End Client this work product once the End Client pays for it in full to Client. This means the Contractor is giving the End Client all of its rights, titles, and interests in and to the work product (including intellectual property rights), and the End Client will be the sole owner of it." },
  { heading: "3. COMPETITIVE ENGAGEMENTS", text: "The Contractor won't work for a competitor of the End Client until this Contract ends. To avoid confusion, a competitor is any third party that develops, manufactures, promotes, sells, licenses, distributes, or provides products or services that are substantially similar to the End Client's products or services." },
  { heading: "4. NON-SOLICITATION", text: "Until this Contract ends, the Contractor won't encourage End Client employees or service providers to stop working for the End Client for any reason." },
  { heading: "5. REPRESENTATIONS", text: "" },
  { heading: "5.1 Overview.", text: "This section contains important promises between the parties." },
  { heading: "6. TERM AND TERMINATION", text: "This Contract is ongoing, until ended by the Client or the Contractor. Either party may end this Contract for any reason by sending an email or letter to the other party, informing the recipient that the sender is ending the Contract and that the Contract will end in 30 days." },
  { heading: "7. INDEPENDENT CONTRACTOR", text: "On behalf of the End Client, the Client is contracting the services of the Contractor as an independent contractor. The Contractor will use its own equipment, tools, and material to do the work. Neither the Client, nor the End Client, will control the details of how the services are performed on a day-to-day basis." },
  { heading: "8. CONFIDENTIAL INFORMATION", text: "This Contract imposes special restrictions on how the End Client and the Contractor must handle confidential information." },
  { heading: "9. LIMITATION OF LIABILITY", text: "Neither party is liable for breach-loss that the breaching party could not reasonably have foreseen when it entered into this Contract." },
  { heading: "10. INDEMNITY", text: "Each party agrees to indemnify the other party against damages arising from a breach of this Contract." },
  { heading: "Signatures", text: "", isSignatureBlock: true },
];

export const AgreementViewerSheet: React.FC<AgreementViewerSheetProps> = ({
  open,
  onClose,
  worker,
  isEmployee,
}) => {
  const sections = isEmployee 
    ? getEmploymentAgreement(worker) 
    : getContractorAgreement(worker);

  const agreementTitle = isEmployee ? "Employment Agreement" : "Contractor Agreement";

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent 
        side="right" 
        className="w-[680px] sm:max-w-[680px] p-0 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <SheetHeader className="px-6 py-5 border-b border-border/40 shrink-0 bg-background pt-12">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-base">{agreementTitle}</SheetTitle>
                <Badge 
                  variant="outline" 
                  className="text-[10px] px-1.5 py-0 h-4 bg-accent-green-fill/10 text-accent-green-text border-accent-green-outline/20 gap-0.5"
                >
                  <CheckCircle2 className="h-2.5 w-2.5" />
                  Signed
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {worker.name} · {worker.countryFlag} {worker.country}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Agreement Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            {/* Document-style container */}
            <div className="bg-background border border-border/60 rounded-xl shadow-sm">
              <div className="px-8 py-8 space-y-4">
                {sections.map((section, idx) => {
                  if (section.isSignatureBlock) {
                    return (
                      <div key={idx} className="mt-8 pt-6 border-t border-border/40">
                        <h3 className="text-sm font-semibold text-foreground mb-1">Signatures</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                          THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                          {/* Fronted signatory */}
                          <div className="space-y-2">
                            <div className="h-16 flex items-end">
                              <span className="font-['Caveat',_cursive] text-2xl text-foreground italic">
                                Ma Angelo Bartolome
                              </span>
                            </div>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium text-foreground">Ma Angelo Bartolome</p>
                              <p className="text-xs text-muted-foreground">COO, Fronted AS</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">Signed Jan 28, 2026 · 14:32 UTC</p>
                            </div>
                          </div>
                          {/* Worker signatory */}
                          <div className="space-y-2">
                            <div className="h-16 flex items-end">
                              <span className="font-['Caveat',_cursive] text-2xl text-foreground italic">
                                {worker.name}
                              </span>
                            </div>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium text-foreground">{worker.name}</p>
                              <p className="text-xs text-muted-foreground">{isEmployee ? "Employee" : "Contractor"}</p>
                              <p className="text-[10px] text-muted-foreground/60 mt-1">Signed Jan 29, 2026 · 09:15 UTC</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={idx}>
                      {section.heading && (
                        <h3 className={cn(
                          "font-semibold text-foreground mb-1.5",
                          idx === 0 ? "text-lg text-center mb-4" : "text-sm"
                        )}>
                          {section.heading}
                        </h3>
                      )}
                      {section.text && (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
                          {section.text}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/40 bg-background shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Read-only · Signed document</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AgreementViewerSheet;
