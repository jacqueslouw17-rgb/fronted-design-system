/**
 * F1v5_ContractDraftWorkspace - Contract Draft Workspace for Flow 1 v5
 * 
 * ISOLATED: Independent copy of ContractDraftWorkspace with multi-document
 * tabs and pagination support. Changes here do NOT affect any other flow.
 */

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClauseTooltip } from "@/components/ClauseTooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// Tabs replaced with custom button-based tab UI for stronger active state
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { CheckCircle2, Briefcase, Shield, FileText, Handshake, ScrollText, Pencil, RotateCcw, X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
import { ContractCarousel } from "@/components/contract-flow/ContractCarousel";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { useAgentState } from "@/hooks/useAgentState";
import { ContractAuditLog } from "@/components/contract-flow/ContractAuditLog";
import { useGlobalContractAuditLog } from "@/hooks/useContractAuditLog";
import { ContractRichTextEditor } from "@/components/contract-flow/ContractRichTextEditor";
import { cn } from "@/lib/utils";

type DocumentType = "employment-agreement" | "contractor-agreement" | "nda" | "nda-policy" | "data-privacy" | "country-compliance";

interface ContractDraftWorkspaceProps {
  candidate: Candidate;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  allDocsPreConfirmed?: boolean;
}

// Helper to wrap variable data with highlight markers
const hl = (value: string) => `{{hl}}${value}{{/hl}}`;

type Section = { heading: string; text: string };

const getContractContent = (candidate: Candidate, documentType: DocumentType): Section[] => {
  switch (documentType) {
    case "employment-agreement":
      return [
        { heading: "Employment Agreement", text: "" },
        { heading: "", text: `This employment agreement (the «Employment Agreement») is entered into on the date hereof between:\n\n1. Fronted Sweden AB (NewCo 8634 Sweden AB), reg. no. 559548-9914, with a registered address at Ekensbergsvägen 113 4 Tr, 171 41 Solna, (the «Company» or «Employer»); and\n2. ${hl(candidate.name)}, born ${hl(candidate.startDate)}, with residence at ${hl(candidate.country)} (the «Employee»)\n\nThe Company and the Employee are jointly referred to as the «Parties» and each is a «Party».` },
        { heading: "Key Terms of the Employment (the \"Terms\"):", text: `A. Job Role: ${hl(candidate.role)}\nB. Job Description: Annex A\nC. Place of Work: ${hl(candidate.country)}\nD. Annual Gross Salary: ${hl(candidate.salary)}\nE. Variable Salary Elements: Addendum B\nF. Start Date: ${hl(candidate.startDate)}\nG. Contract Term: Indefinite Employment\nH. Probationary Period: ${hl("6 months")}\nI. Notice Period:\n   a. Employer: Per the Employment Protection Act\n   b. Employee: ${hl(candidate.noticePeriod)}\nJ. Employment Status: Full-time\nK. Working Hours: ${hl("40 hours per week")}\nL. Holiday: ${hl(candidate.pto)}\nM. Pension: Public Pension + 4.5% Occupational Pension\nN. Other benefits: Per company policy` },
        { heading: "Detailed Terms of the Employment (the \"Detailed Terms\"):", text: "" },
        { heading: "1. Position and assignments", text: `1.1. The Employee is employed as ${hl(candidate.role)}, effective from ${hl(candidate.startDate)}.\n\n1.2. Unless otherwise defined in (G) and (H), the employment term is indefinite.\n\n1.3. Their work shall be performed in accordance with the framework of the instructions provided by the Company and their clients. The Employee shall perform their duties in accordance with the applicable job description, policies and work rules of the Company and their clients, which may be amended from time to time.\n\n1.4. The Employee shall ensure that the interests of the Company and their clients are safeguarded and promoted in accordance with principles that are ethically and commercially accepted, and in accordance with applicable legislation.\n\n1.5. The Employee shall place their working capacity at the disposal of the Company according to their employment status (J) and working hours (K), and shall, to the extent permissible by law, not engage in other employment that could interfere with obligations that stem from this Agreement.` },
        { heading: "2. Place of work – working hours", text: `2.1. The principal place of work shall be ${hl(candidate.country)}.\n\n2.2. If the Employee is working remotely from home, the Employee confirms that, as of the date of this agreement, their home office is safe and suitable for the performance of the job duties contemplated under this agreement - and undertakes to notify the Company at any time during the employment if the work environment ceases to be considered fully satisfactory.\n\n2.3. The normal working hours are ${hl("eight hours a day")}, totalling ${hl("forty hours per week")}, unless otherwise specified in (K). Unless otherwise agreed, the Employee's ordinary working hours are scheduled Monday to Friday during normal office hours.\n\n2.4. The Employee's salary is intended to compensate for all work performed, including reasonable overtime. The Employee is therefore not entitled to separate overtime compensation unless expressly agreed in writing.\n\n2.5. The Employee is not permitted to work outside of the designated country for more than fourteen days at a time, and no more than 30 days per calendar year, without prior written approval by the Company.` },
        { heading: "3. Salary", text: `3.1. The Employee's gross annual salary shall be ${hl(candidate.salary)}, payable in monthly arrears in accordance with the Company's ordinary payroll practices and subject to statutory deductions. The payroll date of the Company is the 25th of each month, or the business day prior if the 25th of the month is a bank holiday.\n\n3.2. If the compensation plan for the Employee consists of a variable element, such as commission or result-based bonuses (E), this shall be regulated by an addendum.\n\n3.3. Notwithstanding the foregoing, the Company may decide to pay bonuses at the full discretion of the Company. Previously paid discretionary bonuses does not represent a fixed part of the compensation of the Employee, and does not guarantee any future payments of such discretionary bonuses.\n\n3.4. If incorrect salary or bonuses are paid, the Company is entitled to correct such errors in accordance with applicable law, including by set-off where legally permitted.` },
        { heading: "4. Other benefits", text: "4.1. The Employee may be entitled to other benefits according to the Company's applicable policies as may be implemented by the Company from time to time. Any such benefits shall be taxed in accordance with prevailing laws and regulations." },
        { heading: "5. Expenses", text: "5.1. The Company shall cover all pre-approved expenses in connection with business activities in accordance with the Company's applicable expense reimbursement policy." },
        { heading: "6. Pension and insurance", text: `6.1. The Employee is entitled to the statutory public pension in accordance with applicable social security and pension legislation as amended from time to time. The Employer shall make all mandatory employer social security contributions required by law, including those forming the basis for the Employee's statutory public pension. Nothing in this Agreement limits the Employee's rights under mandatory pension legislation.\n\n6.2. In addition to the statutory public pension, the Employee shall be entitled to an occupational pension. The Employer shall, during the term of employment, pay pension contributions corresponding to ${hl("4.5%")} of the Employee's current base salary to an occupational pension arrangement designated by the Employer, in accordance with the terms and conditions of such pension plan.` },
        { heading: "7. Holiday and holiday allowance", text: "7.1. The Employee is entitled to annual holiday in accordance with the applicable Holiday Act." },
        { heading: "8. Sick leave", text: "8.1. In case of absence due to illness, the Employee is entitled to sick pay in accordance with the applicable Sick Pay Act." },
        { heading: "9. Confidentiality", text: "The Employee shall keep confidential all business related and internal information that is not generally known concerning the Company, any group companies and/or any of the Company's clients, vendors, suppliers or other third parties. This confidentiality obligation includes, but is not limited to, trade secrets, business plans/strategies, commercial contract terms such as price structure/rebates, financial information, information regarding customers/suppliers or other employees, including personal data, as well as ideas, concepts, and know-how. The Employee shall not disclose information to other employees of the Company if this is not necessary for such other employees' work. The confidentiality obligations described shall apply both during and after the employment period." },
        { heading: "10. Intellectual Property Rights", text: "The Company shall, free of charge unless otherwise regulated by law, become the owner of all intellectual property created or developed by the Employee in connection with the employment, irrespective of whether these have been created or developed outside working hours, and with or without the Employee's personal equipment or devices." },
        { heading: "11. Termination", text: `Following the expiry of the probationary period (if applicable), termination of employment and notice periods under this Agreement shall comply with the relevant and mandatory provisions of the applicable Employment Protection Act, as amended from time to time.\n\nIf the Employee gives notice of resignation, the Employer is entitled to a notice period of ${hl(candidate.noticePeriod)}.` },
        { heading: "12. Probationary period", text: `12.1. The Parties agree that the employment shall commence with a probationary period of ${hl("six (6) months")}. During this probationary period, either party may terminate the employment by giving ${hl("fourteen (14) days")}' written notice.` },
        { heading: "13. Non-solicitation of Clients", text: "13.1. During the term of employment, and for 12 months after the termination of employment, the Employee is prohibited from contacting clients whom the Employee has had contact with during their employment during the last 12 months, for the purpose of obtaining their business or partnership." },
        { heading: "14. Non-solicitation of Employees", text: "14.1. During the term of employment, and for 12 months after termination of employment, the Employee is prohibited from directly or indirectly influencing or attempting to influence any of the Company's employees or consultants to leave the Company." },
        { heading: "15. Disputes and Governing Law", text: `15.1. This Employment Agreement is signed digitally and governed by ${hl(candidate.country)} law, including the applicable Employment Protection Act.\n\n15.2. No collective bargaining agreement applies to this employment.` },
        { heading: "Signatures", text: `THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.\n\n___________________          ___________________\nMa Angelo Bartolome          ${hl(candidate.name)}\nCOO, Fronted AS              Employee` }
      ];
    case "contractor-agreement":
      return [
        { heading: "Contractor Agreement", text: "" },
        { heading: "", text: `This Contract is between Fronted AS, a Norwegian Company, and ${hl(candidate.name)}, ${hl(candidate.country)} (the "Contractor"). Any reference to the "Client" in the following is a reference to Fronted AS. Any reference to "End Client" in the following is a reference to the Client Company.` },
        { heading: "1. WORK AND PAYMENT", text: "" },
        { heading: "1.1 Project.", text: `The Client is contracting the services of the Contractor to do the following: ${hl(candidate.role)}.` },
        { heading: "1.2 Schedule.", text: `The Contractor will begin performing their services on ${hl(candidate.startDate)} and will continue until termination of this Contract. This Contract can be ended by either Client or Contractor at any time, pursuant to the terms of Section 6, Term and Termination.` },
        { heading: "1.2.1 Work hours.", text: `Work hours are ${hl("8 hours per day")}, with flexibility, but availability during CET business hours is required.` },
        { heading: "1.3 Payment.", text: `The Client shall pay the Contractor a fixed consultancy fee of ${hl(candidate.salary)} per month, payable against invoice, for the Services.` },
        { heading: "1.4 Expenses.", text: "The Contractor shall be responsible for all expenses incurred in the performance of the Services, except for any expenses expressly pre-approved in writing by the Client, which shall be reimbursed against valid receipts." },
        { heading: "1.5 Invoices.", text: "The Contractor will invoice Fronted AS. Fronted AS agrees to pay the amount owed at the end of each month of receiving the invoice. Under the condition the invoice is not contested by the End Client. Invoices must reflect actual work performed during the invoiced period. Submitting an invoice for a period when no services were rendered, or retaining payment for such period, constitutes unjust enrichment and a breach of this Contract, and the Client shall have the right to claim restitution." },
        { heading: "2. OWNERSHIP AND LICENSES", text: "" },
        { heading: "2.1 Client Owns All Work Product.", text: "As part of this consultancy, the Contractor is creating a \"work product\" for the Client. The Contractor hereby gives the End Client this work product once the End Client pays for it in full to Client. This means the Contractor is giving the End Client all of its rights, titles, and interests in and to the work product (including intellectual property rights), and the End Client will be the sole owner of it." },
        { heading: "3. COMPETITIVE ENGAGEMENTS", text: "The Contractor won't work for a competitor of the End Client until this Contract ends. To avoid confusion, a competitor is any third party that develops, manufactures, promotes, sells, licenses, distributes, or provides products or services that are substantially similar to the End Client's products or services." },
        { heading: "4. NON-SOLICITATION", text: "Until this Contract ends, the Contractor won't encourage End Client employees or service providers to stop working for the End Client for any reason." },
        { heading: "5. REPRESENTATIONS", text: "" },
        { heading: "5.1 Overview.", text: "This section contains important promises between the parties." },
        { heading: "6. TERM AND TERMINATION", text: `This Contract is ongoing, until ended by the Client or the Contractor. Either party may end this Contract for any reason by sending an email or letter to the other party, informing the recipient that the sender is ending the Contract and that the Contract will end in ${hl(candidate.noticePeriod)}.` },
        { heading: "7. INDEPENDENT CONTRACTOR", text: "On behalf of the End Client, the Client is contracting the services of the Contractor as an independent contractor. The Contractor will use its own equipment, tools, and material to do the work. Neither the Client, nor the End Client, will control the details of how the services are performed on a day-to-day basis." },
        { heading: "8. CONFIDENTIAL INFORMATION", text: "This Contract imposes special restrictions on how the End Client and the Contractor must handle confidential information." },
        { heading: "9. LIMITATION OF LIABILITY", text: "Neither party is liable for breach-loss that the breaching party could not reasonably have foreseen when it entered into this Contract." },
        { heading: "10. INDEMNITY", text: "Each party agrees to indemnify the other party against damages arising from a breach of this Contract." },
        { heading: "Signatures", text: "THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.\n\n___________________          ___________________\nMa Angelo Bartolome          " + candidate.name + "\nCOO, Fronted AS              Contractor" }
      ];
    case "country-compliance":
      return [
        { heading: `COUNTRY COMPLIANCE ATTACHMENTS (${candidate.countryCode})`, text: "" },
        { heading: "", text: `This attachment supplements the Employment Agreement and includes mandatory clauses for ${candidate.country}.` },
        { heading: "1. LOCAL LABOR LAW COMPLIANCE", text: `This employment relationship is governed by ${candidate.country} labor laws including regulations on working hours, overtime, holidays, and termination procedures.` },
        { heading: "2. STATUTORY BENEFITS", text: `Employee is entitled to all statutory benefits required under ${candidate.country} law, including but not limited to: government-mandated insurance, pension contributions, and statutory leave entitlements.` },
        { heading: "3. MANDATORY CLAUSES", text: `In accordance with ${candidate.country} employment regulations, this Agreement includes all mandatory clauses required by local law regarding: workplace safety, anti-discrimination, harassment prevention, and dispute resolution.` },
        { heading: "4. LOCAL LANGUAGE REQUIREMENTS", text: `This Agreement has been prepared in English. In accordance with local requirements, a certified translation in the official language of ${candidate.country} shall be provided if required by law.` }
      ];
    case "nda":
      return [
        { heading: "NON-DISCLOSURE AGREEMENT", text: "" },
        { heading: "", text: `This Non-Disclosure Agreement ("Agreement") is made between Fronted AS, a Norwegian company with registered address at Ekensbergsvägen 113, 171 41 Solna ("Company" or "Disclosing Party") and ${hl(candidate.name)}, residing in ${hl(candidate.country)} ("Recipient" or "Receiving Party").\n\nThis Agreement is entered into as of ${hl(candidate.startDate)} and governs the disclosure, handling, and protection of Confidential Information shared between the Parties.` },
        { heading: "1. DEFINITIONS", text: `1.1 "Confidential Information" means any and all non-public, proprietary, or sensitive information disclosed by the Disclosing Party to the Receiving Party, whether orally, in writing, electronically, or by any other means, including but not limited to:\n\n(a) Trade secrets, inventions, discoveries, know-how, processes, techniques, algorithms, software programs, source code, and related documentation;\n(b) Business plans, strategies, forecasts, projections, market analyses, and financial data;\n(c) Client lists, vendor lists, pricing structures, contract terms, and supplier agreements;\n(d) Technical data, specifications, designs, prototypes, and product roadmaps;\n(e) Employee information, organizational charts, compensation data, and human resources records;\n(f) Any information marked or designated as "Confidential," "Proprietary," or with similar markings.\n\n1.2 "Authorized Purpose" means the performance of services by the Receiving Party under the associated Employment Agreement or Contractor Agreement entered into between the Parties.` },
        { heading: "2. OBLIGATIONS OF THE RECEIVING PARTY", text: `2.1 The Receiving Party agrees to:\n\n(a) Hold all Confidential Information in strict confidence and not disclose it to any third party without the prior written consent of the Disclosing Party;\n(b) Use the Confidential Information solely for the Authorized Purpose;\n(c) Limit access to Confidential Information to those individuals within the Receiving Party's organization who have a need to know and who are bound by confidentiality obligations at least as restrictive as those in this Agreement;\n(d) Exercise at least the same degree of care to protect the Confidential Information as the Receiving Party uses to protect its own confidential information, but in no event less than reasonable care;\n(e) Promptly notify the Disclosing Party in writing of any unauthorized disclosure, use, or access of Confidential Information;\n(f) Not copy or reproduce Confidential Information except as reasonably necessary for the Authorized Purpose.` },
        { heading: "3. EXCLUSIONS FROM CONFIDENTIAL INFORMATION", text: "3.1 The obligations set forth in this Agreement shall not apply to information that:\n\n(a) Was publicly available at the time of disclosure or becomes publicly available through no fault of the Receiving Party;\n(b) Was already known to the Receiving Party prior to disclosure, as demonstrated by written records;\n(c) Is independently developed by the Receiving Party without use of or reference to the Confidential Information;\n(d) Is received from a third party who is not bound by a confidentiality obligation to the Disclosing Party;\n(e) Is required to be disclosed by applicable law, regulation, or court order, provided that the Receiving Party gives the Disclosing Party prompt written notice and cooperates with any efforts to obtain a protective order." },
        { heading: "4. RETURN AND DESTRUCTION OF MATERIALS", text: "4.1 Upon termination of this Agreement or upon the Disclosing Party's written request, the Receiving Party shall promptly:\n\n(a) Return all originals, copies, and reproductions of Confidential Information in any form;\n(b) Destroy all notes, analyses, compilations, studies, and other documents that contain or reflect Confidential Information;\n(c) Certify in writing to the Disclosing Party that all such materials have been returned or destroyed;\n(d) Delete all electronic copies of Confidential Information from all systems, devices, and storage media within 14 days.\n\n4.2 Notwithstanding the foregoing, the Receiving Party may retain copies of Confidential Information to the extent required by applicable law or regulation, provided that such retained copies remain subject to the confidentiality obligations of this Agreement." },
        { heading: "5. INTELLECTUAL PROPERTY", text: "5.1 No license, express or implied, is granted to the Receiving Party under any patent, copyright, trademark, trade secret, or other intellectual property right of the Disclosing Party by virtue of this Agreement or any disclosure of Confidential Information.\n\n5.2 All Confidential Information remains the exclusive property of the Disclosing Party. The Receiving Party acknowledges that it has no rights in or to the Confidential Information except as expressly granted herein.\n\n5.3 Any improvements, modifications, or derivative works created by the Receiving Party using Confidential Information shall be the sole property of the Disclosing Party." },
        { heading: "6. TERM AND SURVIVAL", text: "6.1 This Agreement shall remain in effect for the duration of the relationship between the Parties and for a period of three (3) years following termination of the relationship.\n\n6.2 The obligations of confidentiality with respect to trade secrets shall survive for as long as such information qualifies as a trade secret under applicable law.\n\n6.3 Termination of this Agreement shall not release the Receiving Party from any obligation with respect to Confidential Information disclosed prior to the effective date of termination." },
        { heading: "7. REMEDIES", text: "7.1 The Receiving Party acknowledges that any breach of this Agreement may cause irreparable harm to the Disclosing Party for which monetary damages may be inadequate. Accordingly, the Disclosing Party shall be entitled to seek equitable relief, including injunction and specific performance, in addition to all other remedies available at law or in equity.\n\n7.2 The Receiving Party shall indemnify and hold harmless the Disclosing Party against any and all losses, damages, claims, and expenses (including reasonable attorney's fees) arising from or related to any breach of this Agreement by the Receiving Party." },
        { heading: "8. GENERAL PROVISIONS", text: `8.1 Governing Law. This Agreement shall be governed by and construed in accordance with the laws of ${hl(candidate.country)}, without regard to its conflict of laws principles.\n\n8.2 Entire Agreement. This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof and supersedes all prior or contemporaneous oral or written agreements.\n\n8.3 Amendment. No modification of this Agreement shall be effective unless made in writing and signed by both Parties.\n\n8.4 Severability. If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.\n\n8.5 Waiver. The failure of either Party to enforce any provision of this Agreement shall not be construed as a waiver of such provision or the right to enforce it at a later time.\n\n8.6 Assignment. This Agreement may not be assigned by the Receiving Party without the prior written consent of the Disclosing Party.` },
        { heading: "Signatures", text: `THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.\n\n___________________          ___________________\nMa Angelo Bartolome          ${hl(candidate.name)}\nCOO, Fronted AS              Recipient` }
      ];
    case "nda-policy":
      return [
        { heading: "NDA & COMPANY POLICY ACKNOWLEDGMENT", text: "" },
        { heading: "", text: `This document serves as acknowledgment by ${candidate.name} of receipt and understanding of Company policies and confidentiality obligations.` },
        { heading: "1. CONFIDENTIALITY AGREEMENT", text: "Employee/Contractor agrees to maintain confidentiality of all Company proprietary information, trade secrets, client data, and business strategies. This obligation extends beyond termination of the relationship." },
        { heading: "2. COMPANY POLICIES", text: "I acknowledge receipt of and agree to comply with all Company policies including: Code of Conduct, Information Security Policy, Anti-Harassment Policy, and Data Protection Guidelines." },
        { heading: "3. INTELLECTUAL PROPERTY", text: "I understand that all work product, inventions, and intellectual property created during my engagement with the Company belongs exclusively to the Company." },
        { heading: "4. POLICY ACKNOWLEDGMENT", text: "I confirm that I have read, understood, and agree to abide by all Company policies. I understand that violation of these policies may result in disciplinary action up to and including termination." }
      ];
    case "data-privacy":
      return [
        { heading: `DATA PRIVACY ADDENDUM (${candidate.countryCode})`, text: "" },
        { heading: "", text: `This Data Privacy Addendum ("Addendum") supplements the Agreement between Fronted Sweden AB (NewCo 8634 Sweden AB), reg. no. 559548-9914 ("Company", "Controller") and ${hl(candidate.name)} ("Data Subject") and is governed by applicable data protection legislation in ${hl(candidate.country)}.` },
        { heading: "1. SCOPE AND PURPOSE", text: `1.1 This Addendum sets out the terms under which the Company collects, processes, stores, and protects personal data relating to the Data Subject in connection with the employment or contractor relationship.\n\n1.2 The Company acts as the Data Controller for all personal data processed under this Addendum.\n\n1.3 This Addendum applies to all personal data processed from the date of engagement through the applicable retention period following termination.` },
        { heading: "2. CATEGORIES OF PERSONAL DATA", text: `2.1 The Company collects and processes the following categories of personal data:\n\n(a) Identity Data: Full legal name, date of birth, nationality, gender, photograph, government-issued identification numbers;\n(b) Contact Data: Residential address, email address, telephone numbers, emergency contact details;\n(c) Employment Data: Job title, department, employment history, qualifications, performance reviews, training records;\n(d) Financial Data: Bank account details, tax identification numbers, salary information, pension contributions, expense claims;\n(e) IT Data: Device identifiers, login credentials, IP addresses, system access logs, email communications;\n(f) Health Data: Sick leave records, occupational health assessments, disability accommodations (processed only where legally required or with explicit consent).` },
        { heading: "3. LEGAL BASIS FOR PROCESSING", text: `3.1 The Company processes personal data on the following legal bases:\n\n(a) Performance of Contract: Processing necessary for the performance of the employment or contractor agreement;\n(b) Legal Obligation: Processing required to comply with applicable employment, tax, social security, and immigration laws in ${hl(candidate.country)};\n(c) Legitimate Interests: Processing necessary for the Company's legitimate business interests, including security, fraud prevention, and business operations;\n(d) Consent: Where no other legal basis applies, the Company will obtain explicit consent prior to processing.\n\n3.2 Where processing is based on consent, the Data Subject has the right to withdraw consent at any time without affecting the lawfulness of processing based on consent before its withdrawal.` },
        { heading: "4. PURPOSE OF PROCESSING", text: "4.1 Personal data is processed for the following purposes:\n\n(a) Administration and management of the employment or contractor relationship;\n(b) Payroll processing, tax withholding, and statutory reporting;\n(c) Benefits administration, including pension, insurance, and leave management;\n(d) Performance management, training, and career development;\n(e) Compliance with legal and regulatory obligations;\n(f) Health and safety obligations;\n(g) IT system administration and security monitoring;\n(h) Business planning, analytics, and reporting;\n(i) Legal proceedings, investigations, and dispute resolution." },
        { heading: "5. DATA SHARING AND TRANSFERS", text: `5.1 The Company may share personal data with the following categories of recipients:\n\n(a) Group companies and affiliates for administrative purposes;\n(b) Payroll providers, pension administrators, and insurance companies;\n(c) Government authorities, tax agencies, and regulatory bodies as required by law;\n(d) Professional advisors, including lawyers, auditors, and accountants;\n(e) IT service providers and cloud hosting providers;\n(f) Client companies where required for the performance of services.\n\n5.2 International Transfers. Where personal data is transferred outside of ${hl(candidate.country)} or the European Economic Area, the Company ensures adequate safeguards are in place, including:\n\n(a) Standard Contractual Clauses approved by the European Commission;\n(b) Adequacy decisions by relevant data protection authorities;\n(c) Binding Corporate Rules where applicable.\n\n5.3 The Company shall not sell, rent, or trade personal data to any third party for marketing purposes.` },
        { heading: "6. DATA SECURITY", text: "6.1 The Company implements appropriate technical and organizational measures to protect personal data, including:\n\n(a) Encryption of personal data in transit and at rest;\n(b) Access controls and authentication mechanisms;\n(c) Regular security assessments and penetration testing;\n(d) Employee training on data protection and information security;\n(e) Incident response procedures and breach notification protocols;\n(f) Physical security measures for offices and data centers;\n(g) Regular backup and disaster recovery procedures.\n\n6.2 The Company regularly reviews and updates its security measures to ensure ongoing effectiveness against evolving threats." },
        { heading: "7. DATA SUBJECT RIGHTS", text: `7.1 Under applicable data protection law in ${hl(candidate.country)}, the Data Subject has the following rights:\n\n(a) Right of Access: The right to obtain confirmation of whether personal data is being processed and to access such data;\n(b) Right to Rectification: The right to have inaccurate personal data corrected and incomplete data completed;\n(c) Right to Erasure: The right to have personal data deleted where it is no longer necessary for the purpose for which it was collected, subject to legal retention requirements;\n(d) Right to Restriction: The right to restrict processing in certain circumstances;\n(e) Right to Data Portability: The right to receive personal data in a structured, commonly used, and machine-readable format;\n(f) Right to Object: The right to object to processing based on legitimate interests;\n(g) Rights related to Automated Decision-Making: The right not to be subject to decisions based solely on automated processing.\n\n7.2 To exercise any of these rights, the Data Subject may contact the Company's Data Protection Officer at privacy@fronted.com.\n\n7.3 The Company will respond to all valid requests within 30 days.` },
        { heading: "8. DATA RETENTION", text: `8.1 Personal data will be retained for the duration of the employment or contractor relationship and thereafter as follows:\n\n(a) Payroll and tax records: 7 years after termination, as required by tax legislation;\n(b) Employment contracts and amendments: 10 years after termination;\n(c) Performance reviews and disciplinary records: 3 years after termination;\n(d) Health and safety records: As required by applicable ${hl(candidate.country)} legislation;\n(e) IT access logs: 12 months from date of creation;\n(f) Recruitment records (unsuccessful candidates): 6 months from the date of the hiring decision.\n\n8.2 Upon expiry of the retention period, personal data will be securely deleted or anonymized.\n\n8.3 The Company conducts annual reviews of retained data to ensure compliance with this retention schedule.` },
        { heading: "9. DATA BREACH NOTIFICATION", text: "9.1 In the event of a personal data breach that is likely to result in a risk to the rights and freedoms of the Data Subject, the Company shall:\n\n(a) Notify the relevant supervisory authority within 72 hours of becoming aware of the breach;\n(b) Notify the affected Data Subject without undue delay where the breach is likely to result in a high risk to their rights and freedoms;\n(c) Document all breaches, including the facts, effects, and remedial actions taken.\n\n9.2 The Company maintains a data breach response plan and designates a response team to manage breach incidents." },
        { heading: "10. COMPLAINTS AND SUPERVISORY AUTHORITY", text: `10.1 If the Data Subject believes that their data protection rights have been violated, they have the right to lodge a complaint with the competent supervisory authority in ${hl(candidate.country)}.\n\n10.2 The Data Subject may also seek judicial remedy before the courts of ${hl(candidate.country)}.` },
        { heading: "11. AMENDMENTS", text: "11.1 The Company reserves the right to update this Addendum from time to time to reflect changes in applicable data protection laws or the Company's data processing practices.\n\n11.2 The Data Subject will be notified of any material changes to this Addendum in writing at least 30 days before the changes take effect." },
        { heading: "Signatures", text: `THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.\n\n___________________          ___________________\nMa Angelo Bartolome          ${hl(candidate.name)}\nCOO, Fronted AS              Data Subject` }
      ];
  }
};

// Split sections into pages — agreements stay single-page, other docs paginate
const SECTIONS_PER_PAGE = 7;

const isAgreementType = (docType: DocumentType): boolean =>
  docType === "employment-agreement" || docType === "contractor-agreement";

const splitIntoPages = (sections: Section[], documentType: DocumentType): Section[][] => {
  // Agreements are always a single page
  if (isAgreementType(documentType)) return [sections];
  if (sections.length <= SECTIONS_PER_PAGE) return [sections];
  const pages: Section[][] = [];
  for (let i = 0; i < sections.length; i += SECTIONS_PER_PAGE) {
    pages.push(sections.slice(i, i + SECTIONS_PER_PAGE));
  }
  return pages;
};

interface DocumentDef {
  id: DocumentType;
  label: string;
  icon: React.FC<{ className?: string }>;
  shortLabel: string;
}

export const F1v5_ContractDraftWorkspace: React.FC<ContractDraftWorkspaceProps> = ({
  candidate,
  index,
  total,
  onNext,
  onPrevious,
  allDocsPreConfirmed = false,
}) => {
  const employmentType = candidate.employmentType || "contractor";
  
  const { getEditEvents, recordEdit } = useGlobalContractAuditLog();
  const contractId = `${candidate.name.toLowerCase().replace(/\s+/g, '-')}-${candidate.countryCode?.toLowerCase() || 'unknown'}`;
  const editEvents = getEditEvents(contractId, candidate.name);

  // Build documents list
  const documents: DocumentDef[] = useMemo(() => {
    if (employmentType === "employee") {
      return [
        { id: "employment-agreement" as DocumentType, label: "Employment Agreement", icon: FileText, shortLabel: "Agreement" },
        { id: "country-compliance" as DocumentType, label: `Country Compliance (${candidate.countryCode})`, icon: Shield, shortLabel: "Compliance" },
        { id: "nda-policy" as DocumentType, label: "NDA / Policy Docs", icon: Handshake, shortLabel: "NDA/Policy" },
      ];
    }
    return [
      { id: "contractor-agreement" as DocumentType, label: "Contractor Agreement", icon: FileText, shortLabel: "Agreement" },
      { id: "nda" as DocumentType, label: "Non-Disclosure Agreement", icon: Handshake, shortLabel: "NDA" },
      { id: "data-privacy" as DocumentType, label: `Data Privacy (${candidate.countryCode})`, icon: ScrollText, shortLabel: "Privacy" },
    ];
  }, [employmentType, candidate.countryCode]);

  // Active document & page state
  const [activeDocument, setActiveDocument] = useState<DocumentType>(() => {
    // Default to "Agreement" doc if present
    const agreementDoc = documents.find(d => d.label.toLowerCase().includes("agreement"));
    return agreementDoc?.id || documents[0]?.id || "contractor-agreement";
  });

  // Per-document page tracking
  const [pageByDoc, setPageByDoc] = useState<Record<string, number>>({});
  const activePageIndex = pageByDoc[activeDocument] ?? 0;

  const fullContent = getContractContent(candidate, activeDocument);
  const pages = useMemo(() => splitIntoPages(fullContent, activeDocument), [fullContent, activeDocument]);
  const totalPages = pages.length;
  const currentPageContent = pages[activePageIndex] || pages[0] || [];

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  
  // Track which documents have been confirmed (scrolled through)
  const [confirmedDocs, setConfirmedDocs] = useState<Set<string>>(() =>
    allDocsPreConfirmed ? new Set(documents.map(d => d.id)) : new Set()
  );
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState<string>("");
  const [originalContent, setOriginalContent] = useState<string>("");

  const convertSectionsToHtml = useCallback((sections: Section[]) => {
    return sections.map(section => {
      let html = "";
      if (section.heading) html += `<h2>${section.heading}</h2>`;
      if (section.text) {
        const paragraphs = section.text.split("\n\n");
        html += paragraphs.map(p => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
      }
      return html;
    }).join("");
  }, []);

  const handleEnterEditMode = useCallback(() => {
    // Edit the FULL document content (all pages), not just current page
    const htmlContent = convertSectionsToHtml(fullContent);
    setEditedContent(htmlContent);
    setOriginalContent(htmlContent);
    setIsEditMode(true);
  }, [fullContent, convertSectionsToHtml]);

  const handleCancelEdit = useCallback(() => {
    setEditedContent(originalContent);
    setIsEditMode(false);
  }, [originalContent]);

  const isContentEmpty = useMemo(() => {
    if (!editedContent) return true;
    const textContent = editedContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length === 0;
  }, [editedContent]);

  const handleSaveChanges = useCallback(() => {
    if (isContentEmpty) {
      toast.error("Contract cannot be empty", { description: "Please add content before saving." });
      return;
    }
    toast.success("Contract changes saved");
    setIsEditMode(false);
    setHasChangesSinceReset(true);
    recordEdit(contractId, "You", candidate.name, 'edit');
  }, [isContentEmpty, recordEdit, contractId, candidate.name]);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasChangesSinceReset, setHasChangesSinceReset] = useState(true);

  const handleResetContract = useCallback(() => {
    setIsResetDialogOpen(false);
    setIsResetting(true);
    setTimeout(() => {
      const regeneratedHtml = convertSectionsToHtml(fullContent);
      setEditedContent(regeneratedHtml);
      setOriginalContent(regeneratedHtml);
      setIsEditMode(false);
      setIsResetting(false);
      setHasChangesSinceReset(false);
      recordEdit(contractId, "You", candidate.name, 'reset');
      toast.success("Contract reset to original", { description: "The contract has been regenerated using the current candidate data." });
    }, 4000);
  }, [convertSectionsToHtml, fullContent, recordEdit, contractId, candidate.name]);

  // Audit log slot
  const auditLogSlotRef = useRef<HTMLDivElement>(null);
  const [auditLogSlotHeight, setAuditLogSlotHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = auditLogSlotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAuditLogSlotHeight(el.clientHeight));
    ro.observe(el);
    setAuditLogSlotHeight(el.clientHeight);
    return () => ro.disconnect();
  }, [candidate.id]);

  const renderHighlightedText = useCallback((text: string) => {
    const parts = text.split(/(\{\{hl\}\}.*?\{\{\/hl\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{hl}}") && part.endsWith("{{/hl}}")) {
        const content = part.slice(6, -7);
        return <span key={i} className="bg-yellow-200 text-foreground px-0.5">{content}</span>;
      }
      return part;
    });
  }, []);

  const getViewportEl = useCallback(() => scrollAreaRef.current, []);

  const scrollAgreementToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = getViewportEl();
    viewport?.scrollTo({ top: 0, behavior });
  }, [getViewportEl]);

  const checkScrolledToBottom = useCallback(() => {
    const viewport = getViewportEl();
    if (!viewport) return;
    const thresholdPx = 24;
    const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setHasScrolledToBottom(remaining <= thresholdPx);
  }, [getViewportEl]);

  useEffect(() => {
    const viewport = getViewportEl();
    if (!viewport) return;
    const onScroll = () => checkScrolledToBottom();
    viewport.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const vp = getViewportEl();
        if (!vp) return;
        const remaining = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
        setHasScrolledToBottom(remaining <= 24);
      });
    });
    return () => viewport.removeEventListener("scroll", onScroll);
  }, [getViewportEl, checkScrolledToBottom, candidate.id, activeDocument, activePageIndex]);

  // Reset on candidate change
  useEffect(() => {
    const agreementDoc = documents.find(d => d.label.toLowerCase().includes("agreement"));
    setActiveDocument(agreementDoc?.id || documents[0]?.id || "contractor-agreement");
    setPageByDoc({});
    setConfirmedDocs(allDocsPreConfirmed ? new Set(documents.map(d => d.id)) : new Set());
    setHasScrolledToBottom(false);
    scrollAgreementToTop("auto");
    const timer = setTimeout(() => {
      const viewport = getViewportEl();
      if (!viewport) return;
      const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setHasScrolledToBottom(remaining <= 24);
    }, 100);
    return () => clearTimeout(timer);
  }, [candidate.id, documents, scrollAgreementToTop, getViewportEl]);

  const { setOpen, addMessage, isSpeaking: isAgentSpeaking } = useAgentState();

  // Handle document tab switch
  const handleDocumentSwitch = useCallback((docId: string) => {
    setActiveDocument(docId as DocumentType);
    scrollAgreementToTop("auto");
    setHasScrolledToBottom(false);
    // Delay must exceed framer-motion exit+enter animation (200ms each)
    setTimeout(() => {
      const viewport = getViewportEl();
      if (!viewport) return;
      const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setHasScrolledToBottom(remaining <= 24);
    }, 450);
  }, [scrollAgreementToTop, getViewportEl]);

  // Page navigation
  const handlePageChange = useCallback((newPage: number) => {
    setPageByDoc(prev => ({ ...prev, [activeDocument]: newPage }));
    scrollAgreementToTop("auto");
    setHasScrolledToBottom(false);
    // Delay must exceed framer-motion exit+enter animation (200ms each)
    setTimeout(() => {
      const viewport = getViewportEl();
      if (!viewport) return;
      const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setHasScrolledToBottom(remaining <= 24);
    }, 450);
  }, [activeDocument, scrollAgreementToTop, getViewportEl]);

  // Candidate stepper
  const candidateStepper = total > 1 ? (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm text-muted-foreground">Candidate</span>
      <span className="text-lg font-bold text-foreground">{index + 1}</span>
      <span className="text-sm text-muted-foreground">/ {total}</span>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </div>
  ) : null;

  const showTabs = documents.length > 1;
  const showPagination = totalPages > 1 && !isEditMode;

  // Document confirmation flow: must scroll each doc (last page if multi-page) before confirming
  const currentDocIndex = documents.findIndex(d => d.id === activeDocument);
  const isLastDocument = currentDocIndex === documents.length - 1;
  const isOnLastPage = activePageIndex >= totalPages - 1;
  // All prior documents must be confirmed before the current one can be confirmed
  const allPriorDocsConfirmed = documents.slice(0, currentDocIndex).every(d => confirmedDocs.has(d.id));
  const canConfirmCurrentDoc = hasScrolledToBottom && isOnLastPage && !isEditMode && allPriorDocsConfirmed;
  const activeDocLabel = documents.find(d => d.id === activeDocument)?.shortLabel ?? "document";

  const handleConfirmDocument = useCallback(() => {
    // Mark current document as confirmed
    setConfirmedDocs(prev => new Set([...prev, activeDocument]));

    if (isLastDocument) {
      // All documents confirmed, proceed to next step
      scrollAgreementToTop();
      onNext();
    } else {
      // Move to next document
      const nextDoc = documents[currentDocIndex + 1];
      if (nextDoc) {
        handleDocumentSwitch(nextDoc.id);
      }
    }
  }, [activeDocument, isLastDocument, currentDocIndex, documents, handleDocumentSwitch, scrollAgreementToTop, onNext]);

  return (
    <div className="space-y-6">
      <AgentHeader 
        title={`Reviewing ${candidate.name.split(' ')[0]}'s Contract for ${candidate.country}`} 
        subtitle="Preview how this contract will appear to the candidate before sending for signature." 
        showPulse={true} 
        isActive={isAgentSpeaking} 
        showInput={false}
        progressIndicator={candidateStepper}
      />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="h-full flex gap-4 items-start">
        {/* Left: Candidate card + Audit Log */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="w-80 flex-shrink-0 flex flex-col h-[600px]">
          <Card className="p-6 border border-border/40 bg-card/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-4xl">{candidate.flag}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">{candidate.role}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <span className="text-xs text-muted-foreground">Template</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  Localized – {candidate.countryCode} {candidate.flag}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Salary</span>
                  <span className="font-medium text-foreground">{candidate.salary}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium text-foreground">{candidate.startDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notice Period</span>
                  <span className="font-medium text-foreground">{candidate.noticePeriod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">PTO</span>
                  <span className="font-medium text-foreground">{candidate.pto}</span>
                </div>
              </div>
            </div>
          </Card>
          <div ref={auditLogSlotRef} className="flex-1 min-h-0 overflow-hidden">
            <ContractAuditLog
              contractId={contractId}
              workerName={candidate.name}
              editEvents={editEvents}
              maxHeightPx={auditLogSlotHeight}
            />
          </div>
        </motion.div>

        {/* Right: Contract viewer with tabs + editor */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.3 }} className="flex-1 flex flex-col h-[600px] min-h-0">
          
          {/* Unified toolbar: tabs + actions in one row */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.3 }} className="rounded-lg border border-border bg-muted/30 p-2 mb-4 flex-shrink-0 flex items-center justify-between gap-3">
            {/* Left: Document tabs or edit context */}
            {isEditMode ? (
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isContentEmpty ? 'bg-destructive' : 'bg-warning animate-pulse'}`} />
                <p className="text-sm text-foreground truncate">
                  Editing <span className="font-medium">{documents.find(d => d.id === activeDocument)?.shortLabel ?? 'document'}</span>
                  {isContentEmpty && <span className="text-destructive ml-1">— cannot be empty</span>}
                </p>
              </div>
            ) : showTabs ? (
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  {documents.map((doc) => {
                    const isActive = activeDocument === doc.id;
                    const isConfirmed = confirmedDocs.has(doc.id);
                    return (
                      <TooltipProvider key={doc.id} delayDuration={300}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => handleDocumentSwitch(doc.id)}
                              className={cn(
                                "inline-flex items-center gap-1.5 text-xs h-7 px-3 rounded-md transition-all duration-200 max-w-[160px] truncate",
                                isActive && isConfirmed
                                  ? "bg-primary/10 text-primary font-medium shadow-sm border border-primary/20"
                                  : isActive
                                    ? "bg-background text-foreground font-medium shadow-sm border border-border/60"
                                    : isConfirmed
                                      ? "bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary border border-primary/10"
                                      : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/40"
                              )}
                            >
                              {isConfirmed ? (
                                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
                              ) : (
                                <doc.icon className="h-3.5 w-3.5 flex-shrink-0" />
                              )}
                              <span className="truncate">{doc.shortLabel}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            {doc.label}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground pl-1">
                {isResetting ? "Regenerating contract from template..." : "Review the contract details carefully before proceeding."}
              </p>
            )}

            {/* Right: Actions */}
            {isEditMode ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleCancelEdit}>Cancel</Button>
                <Button size="sm" className="h-7 text-xs" onClick={handleSaveChanges} disabled={isContentEmpty}>Save Changes</Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setIsResetDialogOpen(true)}
                  disabled={isResetting || !hasChangesSinceReset}
                  className="flex items-center gap-1.5 h-7 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                  Reset {documents.find(d => d.id === activeDocument)?.shortLabel}
                </Button>
                <Button
                  variant="outline" size="sm"
                  onClick={handleEnterEditMode}
                  disabled={isResetting}
                  className="flex items-center gap-1.5 h-7 text-xs"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit {documents.find(d => d.id === activeDocument)?.shortLabel}
                </Button>
              </div>
            )}
          </motion.div>

          {/* Contract content - Editor or Preview */}
          {isEditMode ? (
            <div className="flex-1 min-h-0 rounded-t-lg border border-b-0 border-border bg-background flex flex-col overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="h-full flex flex-col">
                  <ContractRichTextEditor
                    content={editedContent}
                    onChange={setEditedContent}
                    className="border-0 rounded-none flex-1 min-h-0"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          ) : (
            <div ref={scrollAreaRef} className="flex-1 min-h-0 overflow-y-auto rounded-t-lg border border-b-0 border-border bg-background">
              <AnimatePresence mode="wait">
                {isResetting ? (
                  <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-center"><Skeleton className="h-6 w-48" /></div>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-11/12" />
                        <Skeleton className="h-4 w-10/12" />
                      </div>
                      <Skeleton className="h-5 w-40 mt-6" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-9/12" />
                      </div>
                    </div>
                  </motion.div>
                ) : documents.length === 0 ? (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full p-6">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm font-medium">No documents available</p>
                      <p className="text-xs mt-1">No documents have been generated for this candidate yet.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key={`${activeDocument}-${activePageIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                    <div className="p-6">
                      <div className="space-y-4 select-none">
                        {currentPageContent.map((section, idx) => (
                          <div key={idx}>
                            {section.heading && (
                              <h3 className={`${idx === 0 && activePageIndex === 0 ? 'text-lg font-medium mb-4 text-center' : 'text-sm font-medium mb-2'} text-foreground`}>
                                {section.heading}
                              </h3>
                            )}
                            {section.text && (
                              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                                {renderHighlightedText(section.text)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                      {/* Inline pagination at bottom of document content */}
                      {showPagination && (
                        <div className="flex items-center justify-center gap-2 pt-6 pb-2 border-t border-border/40 mt-6">
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handlePageChange(activePageIndex - 1)}
                            disabled={activePageIndex === 0}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronLeft className="h-3.5 w-3.5" />
                          </Button>
                          <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px] text-center">
                            Page {activePageIndex + 1} of {totalPages}
                          </span>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handlePageChange(activePageIndex + 1)}
                            disabled={activePageIndex >= totalPages - 1}
                            className="h-7 w-7 p-0"
                          >
                            <ChevronRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Bottom bar - step navigation + pagination */}
          <div className="flex-shrink-0 p-4 flex gap-3 justify-between items-center bg-background border border-t-0 border-border rounded-b-lg">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => { scrollAgreementToTop(); onPrevious(); }}
                size="lg"
                disabled={isEditMode}
              >
                Previous
              </Button>

            </div>

            <div className="flex items-center gap-2">
              {isEditMode ? (
                <span className="text-xs text-primary">Save or cancel your edits to continue</span>
              ) : null}
              <Button
                onClick={handleConfirmDocument}
                size="lg"
                disabled={!canConfirmCurrentDoc}
              >
                {isLastDocument
                  ? (index === total - 1 ? "Confirm & Continue" : `Confirm ${activeDocLabel}`)
                  : `Confirm ${activeDocLabel}`
                }
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <button
            onClick={() => setIsResetDialogOpen(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset contract to original?</AlertDialogTitle>
            <AlertDialogDescription>
              This will regenerate the contract using the current candidate data and discard all manual edits. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetContract}>Reset Contract</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
