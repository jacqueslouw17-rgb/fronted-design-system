import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClauseTooltip } from "@/components/ClauseTooltip";

import { CheckCircle2, Briefcase, Shield, FileText, Handshake, ScrollText } from "lucide-react";
import type { Candidate } from "@/hooks/useContractFlow";
import { toast } from "sonner";
import { ContractCarousel } from "./ContractCarousel";
import { AgentHeader } from "@/components/agent/AgentHeader";
import { KurtContextualTags } from "@/components/kurt/KurtContextualTags";
import { useAgentState } from "@/hooks/useAgentState";
import { ContractAuditLog } from "./ContractAuditLog";
import { useGlobalContractAuditLog } from "@/hooks/useContractAuditLog";
type DocumentType = "employment-agreement" | "contractor-agreement" | "nda" | "nda-policy" | "data-privacy" | "country-compliance";
interface ContractDraftWorkspaceProps {
  candidate: Candidate;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
}
// Helper to wrap variable data with highlight markers
const hl = (value: string) => `{{hl}}${value}{{/hl}}`;

const getContractContent = (candidate: Candidate, documentType: DocumentType) => {
  switch (documentType) {
    case "employment-agreement":
      // Real Employment Agreement content
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
        { heading: "10. Intellectual Property Rights", text: "The Company shall, free of charge unless otherwise regulated by law, become the owner of all intellectual property created or developed by the Employee in connection with the employment, irrespective of whether these have been created or developed outside working hours, and with or without the Employee's personal equipment or devices. Intellectual property rights include, but are not limited to, intellectual achievements, inventions, trademarks, designs, signs, trade secrets, know-how, copyright, computer software, databases, documentation and other similar materials, irrespective of whether such intellectual property rights are or may be protected by registration or not. For the avoidance of doubt, as owner, the Company will free of charge, have an unlimited right to utilise and amend such intellectual property rights, and to transfer such intellectual property rights to any third party. The Employee agrees not to infringe on any intellectual property rights of a third party. Further, the Employee agrees to assist the Company with the transfer of any and all intellectual property rights, either to the Company or to such third party as the Company may designate, without compensation for such assistance. This Clause shall not be construed as in any way limiting the Parties' rights and obligations according to mandatory law." },
        { heading: "11. Termination", text: `Following the expiry of the probationary period (if applicable), termination of employment and notice periods under this Agreement shall comply with the relevant and mandatory provisions of the applicable Employment Protection Act, as amended from time to time.\n\nIf the Employer gives notice of termination, the Employee is entitled to a notice period that is at least equal to the statutory minimum, currently as follows:\n\n• Less than two (2) years of total employment with the Employer: notice period of one (1) month.\n• At least two (2) but less than four (4) years of total employment: notice period of two (2) months.\n• At least four (4) but less than six (6) years of total employment: notice period of three (3) months.\n• At least six (6) but less than eight (8) years of total employment: notice period of four (4) months.\n• At least eight (8) but less than ten (10) years of total employment: notice period of five (5) months.\n• At least ten (10) years of total employment: notice period of six (6) months.\n\nIf the Employee gives notice of resignation, the Employer is entitled to a notice period of ${hl(candidate.noticePeriod)}.` },
        { heading: "12. Probationary period", text: `12.1. The Parties agree that the employment shall commence with a probationary period of ${hl("six (6) months")}. During this probationary period, either party may terminate the employment by giving ${hl("fourteen (14) days")}' written notice.` },
        { heading: "13. Non-solicitation of Clients", text: "13.1. During the term of employment, and for 12 months after the termination of employment, the Employee is prohibited from contacting clients whom the Employee has had contact with during their employment during the last 12 months, for the purpose of obtaining their business or partnership, including any such contact to notify them regarding the Employee's new employment." },
        { heading: "14. Non-solicitation of Employees", text: "14.1. During the term of employment, and for 12 months after termination of employment, the Employee is prohibited from directly or indirectly influencing or attempting to influence any of the Company's employees or consultants to leave the Company." },
        { heading: "15. Disputes and Governing Law", text: `15.1. This Employment Agreement is signed digitally and governed by ${hl(candidate.country)} law, including the applicable Employment Protection Act.\n\n15.2. No collective bargaining agreement applies to this employment.` },
        { heading: "Signatures", text: `THE PARTIES HERETO AGREE TO THE FOREGOING AS EVIDENCED BY THEIR SIGNATURES BELOW.\n\n___________________          ___________________\nMa Angelo Bartolome          ${hl(candidate.name)}\nCOO, Fronted AS              Employee` }
      ];
    case "contractor-agreement":
      // Real Contractor Agreement content
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
        { heading: "2.1 Client Owns All Work Product.", text: "As part of this consultancy, the Contractor is creating a \"work product\" for the Client. To avoid confusion, work product is the finished product, as well as drafts, notes, materials, mockups, hardware, designs, inventions, patents, code, and anything else that the Contractor works on—that is, conceives, creates, designs, develops, invents, works on, or reduces to practice—as part of this project, whether before the date of this Contract or after. The Contractor hereby gives the End Client this work product once the End Client pays for it in full to Client. This means the Contractor is giving the End Client all of its rights, titles, and interests in and to the work product (including intellectual property rights), and the End Client will be the sole owner of it. The Client can use the work product however it wants or it can decide not to use the work product at all. The Client, for example, can modify, destroy, or sell it, as it sees fit. The Contractor agrees not to delete, restrict, or block access to any digital assets, communications, or tools related to the project." },
        { heading: "2.2 Contractor's Use Of Work Product.", text: "Once the Contractor gives the work product to the End Client, the Contractor does not have any rights to it, except those that the End Client explicitly gives the Contractor here. The End Client gives permission to use the work product as part of portfolios and websites, in galleries, and in other media, so long as it is to showcase the work and not for any other purpose. The Client does not give permission to sell or otherwise use the work product to make money or for any other commercial use. The Client is not allowed to take back this license, even after the Contract ends." },
        { heading: "2.3 Contractor's Help Securing Ownership.", text: "In the future, the End Client may need the Contractor's help to show that the End Client owns the work product or to complete the transfer. The Contractor agrees to help with that. For example, the Contractor may have to sign a patent application. The End Client will pay any required expenses for this. If the End Client can't find the Contractor, the Contractor agrees that the End Client can act on the Contractor's behalf to accomplish the same thing. The following language gives the End Client that right: if the End Client can't find the Contractor after spending reasonable effort trying to do so, the Contractor hereby irrevocably designates and appoints the End Client as the Contractor's agent and attorney-in-fact, which appointment is coupled with an interest, to act for the Contractor and on the Contractor's behalf to execute, verify, and file the required documents and to take any other legal action to accomplish the purposes of paragraph 2.1 (Client Owns All Work Product)." },
        { heading: "2.4 Contractor's IP That Is Not Work Product.", text: "During the course of this project, the Contractor might use intellectual property that the Contractor owns or has licensed from a third party, but that does not qualify as \"work product.\" This is called \"background IP.\" Possible examples of background IP are pre-existing code, type fonts, properly-licensed stock photos, and web application tools. The Contractor is not giving the End Client this background IP. But, as part of the Contract, the Contractor is giving the End Client a right to use and license (with the right to sublicense) the background IP to develop, market, sell, and support the End Client's products and services. The End Client may use this background IP worldwide and free of charge, but it cannot transfer its rights to the background IP (except as allowed in Section 11.1 (Assignment)). The End Client cannot sell or license the background IP separately from its products or services. The Contractor cannot take back this grant, and this grant does not end when the Contract is over." },
        { heading: "2.5 Contractor's Right To Use Client IP.", text: "The Contractor may need to use the End Client's intellectual property to do its job. For example, if the End Client is hiring the Contractor to build a website, the Contractor may have to use the End Client's logo. The End Client agrees to let the Contractor use the End Client's intellectual property and other intellectual property that the End Client controls to the extent reasonably necessary to do the Contractor's job. Beyond that, the End Client is not giving the Contractor any intellectual property rights, unless specifically stated otherwise in this Contract." },
        { heading: "3. COMPETITIVE ENGAGEMENTS", text: "The Contractor won't work for a competitor of the End Client until this Contract ends. To avoid confusion, a competitor is any third party that develops, manufactures, promotes, sells, licenses, distributes, or provides products or services that are substantially similar to the End Client's products or services. A competitor is also a third party that plans to do any of those things. The one exception to this restriction is if the Contractor asks for permission beforehand and the End Client agrees to it in writing. If the Contractor uses employees or subcontractors, the Contractor must make sure they follow the obligations in this paragraph, as well." },
        { heading: "4. NON-SOLICITATION", text: "For the duration of this Contract and for a period of 12 months following its termination or expiry, the Contractor shall not, whether directly or indirectly, for itself or on behalf of any third party:\n\n(a) encourage End Client employees or service providers to stop working for the End Client;\n(b) encourage End Client customers or clients to stop doing business with the End Client; or\n(c) hire anyone who worked for the End Client over the 12-month period before the Contract ended. The Contractor promises that it won't do anything in this paragraph on behalf of itself or a third party." },
        { heading: "5. REPRESENTATIONS", text: "" },
        { heading: "5.1 Overview.", text: "This section contains important promises between the parties." },
        { heading: "5.2 Authority To Sign.", text: "Each party promises to the other party that it has the authority to enter into this Contract and to perform all of its obligations under this Contract." },
        { heading: "5.3 Contractor Has Right To Give Client Work Product.", text: "The Contractor promises that it owns the work product, that the Contractor is able to give the work product to the End Client, and that no other party will claim that it owns the work product. If the Contractor uses employees or subcontractors, the Contractor also promises that these employees and subcontractors have signed contracts with the Contractor giving the Contractor any rights that the employees or subcontractors have related to the Contractor's background IP and work product." },
        { heading: "5.4 Contractor Will Comply With Laws.", text: "The Contractor promises that the manner it does this job, its work product, and any background IP it uses comply with applicable U.S. and foreign laws and regulations." },
        { heading: "5.5 Work Product Does Not Infringe.", text: "The Contractor warrants that its work product does not and will not infringe on someone else's intellectual property rights, that the Contractor has the right to let the End Client use the background IP, and that this Contract does not and will not violate any contract that the Contractor has entered into or will enter into with someone else." },
        { heading: "5.6 Client Will Review Work.", text: "The End Client promises to review the work product, to be reasonably available to the Contractor if the Contractor has questions regarding this project, and to provide timely feedback and decisions." },
        { heading: "5.7 Client-Supplied Material Does Not Infringe.", text: "If the End Client provides the Contractor with material to incorporate into the work product, the End Client promises that this material does not infringe on someone else's intellectual property rights." },
        { heading: "6. TERM AND TERMINATION", text: `This Contract is ongoing, until ended by the Client or the Contractor. Either party may end this Contract for any reason by sending an email or letter to the other party, informing the recipient that the sender is ending the Contract and that the Contract will end in ${hl(candidate.noticePeriod)}. The Contract officially ends once that time has passed. The party that is ending the Contract must provide notice by taking the steps explained in Section 11.4. The Contractor must immediately stop working as soon as it receives this notice, unless the notice says otherwise. The Client will pay the Contractor for the work done up until when the Contract ends and will reimburse the Contractor for any agreed-upon, non-cancellable expenses. The following sections don't end even after the Contract ends: 2 (Ownership and Licenses); 3 (Competitive Engagements); 4 (Non-Solicitation); 5 (Representations); 8 (Confidential Information); 9 (Limitation of Liability); 10 (Indemnity); and 11 (General).` },
        { heading: "7. INDEPENDENT CONTRACTOR", text: "On behalf of the End Client, the Client is contracting the services of the Contractor as an independent contractor. The following statements accurately reflect their relationship:\n\n• The Contractor will use its own equipment, tools, and material to do the work.\n• Neither the Client, nor the End Client, will control the details of how the services are performed on a day-to-day basis. Rather, the Contractor is responsible for determining when, where, and how it will carry out the service.\n• Neither the Client, nor the End Client will provide the Contractor with any training.\n• The Client and the Contractor do not have a partnership or employer employee relationship.\n• The Contractor cannot enter into contracts, make promises, or act on behalf of neither the Client, nor the End Client.\n• The Contractor is not entitled to Neither the Client, nor the End Client's benefits (e.g., group insurance, retirement benefits, retirement plans, vacation days).\n• The determination of the applicable public holiday calendar, whether based on the End-Client's or the Contractor's jurisdiction, shall rest solely with the End-Client. The Contractor shall adhere to the public holidays as designated by the End-Client. Payment for public holidays shall be made only if and as determined by the End-Client in its sole discretion.\n• For avoidance of any doubt, the Contractor is responsible for their own taxes, and the applicable taxes of their employees (if any).\n• Neither the Client, nor the End Client will withhold taxes or make payments for disability insurance, unemployment insurance, or workers compensation for the Contractor or any of the Contractor's employees or subcontractors.\n• The Contractor is solely responsible for any and all employees or subcontractors contracted by the Contractor, and that they shall adhere to this here agreement." },
        { heading: "8. CONFIDENTIAL INFORMATION", text: "" },
        { heading: "8.1 Overview.", text: "This Contract imposes special restrictions on how the End Client and the Contractor must handle confidential information. These obligations are explained in this section." },
        { heading: "8.2 The Client's Confidential Information.", text: "While working for the Client or End Client, the Contractor may come across, or be given, client information that is confidential. This is information like, but not limited to, customer lists, business strategies, research & development notes, statistics about a website, and other information that is private. The Contractor promises to treat this information as if it is the Contractor's own confidential information. The Contractor may use this information to do its job under this Contract, but not for anything else. For example, if the End Client lets the Contractor use a customer list to send out a newsletter, the Contractor cannot use those email addresses for any other purpose. The one exception to this is if the End Client gives the Contractor written permission to use the information for another purpose, the Contractor may use the information for that purpose, as well. When this Contract ends, the Contractor must give back or destroy all confidential information, and confirm that it has done so. The Contractor promises that it will not share confidential information with a third party, unless the Owner of said information gives the Contractor written permission first. The Contractor must continue to follow these obligations, even after the Contract ends. The Contractor's responsibilities only stop if the Contractor can show any of the following:\n\n(i) that the information was already public when the Contractor came across it;\n(ii) the information became public after the Contractor came across it, but not because of anything the Contractor did or didn't do;\n(iii) the Contractor already knew the information when the Contractor came across it and the Contractor didn't have any obligation to keep it secret; or\n(iv) a third party provided the Contractor with the information without requiring that the Contractor keep it a secret." },
        { heading: "8.3 Third-Party Confidential Information.", text: "It's possible the End Client and the Contractor each have access to confidential information that belongs to third parties. The Parties each promise that it will not share confidential information that belongs to third parties, unless it is allowed to do so. If the End Client or the Contractor is allowed to share confidential information and does so, the sharing party promises to tell the other party in writing of any special restrictions regarding that information." },
        { heading: "9. LIMITATION OF LIABILITY", text: "Neither party is liable for breach-of-contract damages that the breaching party could not reasonably have foreseen when it entered this Contract." },
        { heading: "10. INDEMNITY", text: "" },
        { heading: "10.1 Overview.", text: "This section transfers certain risks between the parties if a third party sues or goes after the Client, End Client or the Contractor or all. For example, if the Client gets sued for something that the Contractor did, then the Contractor may promise to come to the Client's defense or to reimburse the Client for any losses." },
        { heading: "10.2 Client Indemnity.", text: "In this Contract, the Contractor agrees to indemnify both the Client and the End Client (and its affiliates and their directors, officers, employees, and agents) from and against all liabilities, losses, damages, and expenses (including reasonable attorneys' fees) related to a third-party claim or proceeding arising out of:\n\n(i) the work the Contractor has done under this Contract;\n(ii) a breach by the Contractor of its obligations under this Contract; or\n(iii) a breach by the Contractor of the promises it is making in Section 5 (Representations)." },
        { heading: "10.3 Contractor Indemnity.", text: "In this Contract, the End Client agrees to indemnify the Contractor (and its affiliates and their directors, officers, employees, and agents) from and against liabilities, losses, damages, and expenses (including reasonable attorneys' fees) related to a third-party claim or proceeding arising out of a breach by the End Client of its obligations under this Contract." },
        { heading: "11. GENERAL", text: "" },
        { heading: "11.1 Assignment.", text: "This Contract applies only to the End Client and the Contractor. The Contractor cannot assign its rights or delegate its obligations under this Contract to a third-party (other than by will or intestate), without first receiving the End Client's written permission. In contrast, the End Client may assign its rights and delegate its obligations under this Contract without the Contractor's permission. This is necessary in case, for example, another party buys out the End Client or if the End Client decides to sell the work product that results from this Contract." },
        { heading: "11.2 Arbitration.", text: "As the exclusive means of initiating adversarial proceedings to resolve any dispute arising under this Contract, a party may demand that the dispute be resolved by arbitration administered by the Norwegian Arbitration Association in accordance with its commercial arbitration rules." },
        { heading: "11.3 Modification; Waiver.", text: "To change anything in this Contract, the Client and the Contractor must agree to that change in writing and sign a document showing their contract. Neither party can waive its rights under this Contract or release the other party from its obligations under this Contract, unless the waiving party acknowledges it is doing so in writing and signs a document that says so." },
        { heading: "11.4 Notices.", text: "(a) Over the course of this Contract, one party may need to send a notice to the other party. For the notice to be valid, it must be in writing and delivered in one of the following ways: personal delivery, email, or certified or registered mail (postage prepaid, return receipt requested). The notice must be delivered to the party's address listed at the end of this Contract or to another address that the party has provided in writing as an appropriate address to receive notice.\n\n(b) The timing of when a notice is received can be very important. To avoid confusion, a valid notice is considered received as follows:\n\n(ii) if delivered by email, it is considered received upon acknowledgement of receipt;\n\n(iii) if delivered by registered or certified mail (postage prepaid, return receipt requested), it is considered received upon receipt as indicated by the date on the signed receipt. If a party refuses to accept notice or if notice cannot be delivered because of a change in address for which no notice was given, then it is considered received when the notice is rejected or unable to be delivered. If the notice is received after 5:00pm on a business day at the location specified in the address for that party, or on a day that is not a business day, then the notice is considered received at 9:00am on the next business day.\n\n(iv) Once the Contractor receives notice of termination or is made aware of such through official communication, they shall immediately cease rendering services, and shall not claim or retain payment for any period in which no services were actually rendered." },
        { heading: "11.5 Severability.", text: "This section deals with what happens if a portion of the Contract is found to be unenforceable. If that's the case, the unenforceable portion will be changed to the minimum extent necessary to make it enforceable, unless that change is not permitted by law, in which case the portion will be disregarded. If any portion of the Contract is changed or disregarded because it is unenforceable, the rest of the Contract is still enforceable." },
        { heading: "11.6 Signatures.", text: "The Client and the Contractor must sign this document using Docusign's e-signing system. These electronic signatures count as originals for all purposes." },
        { heading: "11.7 Governing Law.", text: `The laws of Norway govern the rights and obligations of the Client and the Contractor under this Contract, without regard to conflict of law principles of that country.\n\nWhile this Contract is governed by Norwegian law, the Client reserves the right to initiate restitution or civil recovery actions under the Contractor's local jurisdiction where necessary to enforce financial obligations, including unjust enrichment, misrepresentation, or breach of this Contract.` },
        { heading: "11.8 Entire Contract.", text: "This Contract represents the parties' final and complete understanding of this job and the subject matter discussed in this Contract. This Contract supersedes all other contracts (both written and oral) between the parties. This Contract may only be amended, modified, or supplemented by a written agreement signed by both parties." },
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
        { heading: "", text: `This Non-Disclosure Agreement ("Agreement") is made between Fronted AS ("Company") and ${candidate.name} ("Recipient").` },
        { heading: "1. CONFIDENTIAL INFORMATION", text: "Recipient acknowledges that during the relationship, they may have access to confidential and proprietary information including but not limited to: trade secrets, business strategies, client lists, technical data, and product designs." },
        { heading: "2. OBLIGATIONS", text: "Recipient agrees to: (a) maintain confidentiality of all proprietary information, (b) not disclose such information to third parties, (c) use information solely for authorized purposes, (d) return all materials upon termination." },
        { heading: "3. EXCLUSIONS", text: "This Agreement does not apply to information that: (a) is publicly available, (b) was known prior to disclosure, (c) is independently developed, or (d) is required to be disclosed by law." },
        { heading: "4. TERM", text: "The obligations under this Agreement shall remain in effect during the relationship and for 3 years following termination." }
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
        { heading: "", text: `This Data Privacy Addendum supplements the Agreement between Fronted AS ("Company") and ${candidate.name}.` },
        { heading: "1. DATA COLLECTION", text: `Company collects and processes personal data in accordance with ${candidate.country} data protection laws, including: contact information, identification documents, banking details, and work records.` },
        { heading: "2. PURPOSE OF PROCESSING", text: "Personal data is processed for: administration, payroll processing, compliance with legal obligations, benefits administration, and performance management." },
        { heading: "3. DATA RIGHTS", text: "You have the right to: access personal data, request corrections, request deletion (subject to legal requirements), object to processing, and lodge complaints with supervisory authorities." },
        { heading: "4. DATA SECURITY", text: "Company implements appropriate technical and organizational measures to protect personal data against unauthorized access, alteration, disclosure, or destruction." },
        { heading: "5. DATA RETENTION", text: "Personal data will be retained for the duration of the relationship and as required by law, typically 7 years after termination for tax and employment law purposes." }
      ];
  }
};
export const ContractDraftWorkspace: React.FC<ContractDraftWorkspaceProps> = ({
  candidate,
  index,
  total,
  onNext,
  onPrevious
}) => {
  // Determine employment type (default to contractor if not specified)
  const employmentType = candidate.employmentType || "contractor";
  
  // Contract audit log hook
  const { getEditEvents } = useGlobalContractAuditLog();
  const contractId = `${candidate.name.toLowerCase().replace(/\s+/g, '-')}-${candidate.countryCode?.toLowerCase() || 'unknown'}`;
  const editEvents = getEditEvents(contractId);

  const documents = useMemo(() => {
    if (employmentType === "employee") {
      return [
        {
          id: "employment-agreement" as DocumentType,
          label: "Employment Agreement",
          icon: FileText,
          shortLabel: "Employment",
        },
        {
          id: "country-compliance" as DocumentType,
          label: `Country Compliance (${candidate.countryCode})`,
          icon: Shield,
          shortLabel: "Compliance",
        },
        {
          id: "nda-policy" as DocumentType,
          label: "NDA / Policy Docs",
          icon: Handshake,
          shortLabel: "NDA/Policy",
        },
      ];
    }

    return [
      {
        id: "contractor-agreement" as DocumentType,
        label: "Contractor Agreement",
        icon: FileText,
        shortLabel: "Contract",
      },
      {
        id: "nda" as DocumentType,
        label: "Non-Disclosure Agreement",
        icon: Handshake,
        shortLabel: "NDA",
      },
      {
        id: "data-privacy" as DocumentType,
        label: `Data Privacy (${candidate.countryCode})`,
        icon: ScrollText,
        shortLabel: "Privacy",
      },
    ];
  }, [employmentType, candidate.countryCode]);

  const [activeDocument, setActiveDocument] = useState<DocumentType>(() => documents[0].id);
  const fullContent = getContractContent(candidate, activeDocument);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  // Measure how much vertical space the audit log has under the worker card,
  // so the audit log can cap itself and become scrollable (without stretching UI).
  const auditLogSlotRef = useRef<HTMLDivElement>(null);
  const [auditLogSlotHeight, setAuditLogSlotHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const el = auditLogSlotRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setAuditLogSlotHeight(el.clientHeight);
    });

    ro.observe(el);
    setAuditLogSlotHeight(el.clientHeight);

    return () => ro.disconnect();
  }, [candidate.id]);

  // Helper to render text with highlighted variable data
  const renderHighlightedText = useCallback((text: string) => {
    const parts = text.split(/(\{\{hl\}\}.*?\{\{\/hl\}\})/g);
    return parts.map((part, i) => {
      if (part.startsWith("{{hl}}") && part.endsWith("{{/hl}}")) {
        const content = part.slice(6, -7);
        return (
          <span key={i} className="bg-yellow-200 text-foreground px-0.5">
            {content}
          </span>
        );
      }
      return part;
    });
  }, []);

  const getViewportEl = useCallback(() => {
    return scrollAreaRef.current;
  }, []);

  const scrollAgreementToTop = useCallback((behavior: ScrollBehavior = "smooth") => {
    const viewport = getViewportEl();
    viewport?.scrollTo({ top: 0, behavior });
  }, [getViewportEl]);

  const checkScrolledToBottom = useCallback(() => {
    const viewport = getViewportEl();
    if (!viewport) return;

    const thresholdPx = 24;
    const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    const isAtBottom = remaining <= thresholdPx;

    setHasScrolledToBottom(isAtBottom);
  }, [getViewportEl]);

  // Attach scroll listener to the actual ScrollArea viewport (scroll events don't reliably bubble)
  useEffect(() => {
    const viewport = getViewportEl();
    if (!viewport) return;

    const onScroll = () => checkScrolledToBottom();
    viewport.addEventListener("scroll", onScroll, { passive: true });

    // Initial check (in case content fits without scrolling)
    const checkInitial = () => {
      const vp = getViewportEl();
      if (!vp) return;
      const thresholdPx = 24;
      const remaining = vp.scrollHeight - vp.scrollTop - vp.clientHeight;
      setHasScrolledToBottom(remaining <= thresholdPx);
    };
    
    // Multiple RAF to ensure DOM is fully rendered
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        checkInitial();
      });
    });

    return () => viewport.removeEventListener("scroll", onScroll);
  }, [getViewportEl, checkScrolledToBottom, candidate.id, activeDocument]);

  // Reset scroll state and document when candidate changes
  useEffect(() => {
    setActiveDocument(documents[0].id);
    setHasScrolledToBottom(false);
    scrollAgreementToTop("auto");

    // Delay check to ensure content is rendered
    const timer = setTimeout(() => {
      const viewport = getViewportEl();
      if (!viewport) return;
      const thresholdPx = 24;
      const remaining = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
      setHasScrolledToBottom(remaining <= thresholdPx);
    }, 100);

    return () => clearTimeout(timer);
  }, [candidate.id, documents, scrollAgreementToTop, getViewportEl]);
  const {
    setOpen,
    addMessage,
    isSpeaking: isAgentSpeaking
  } = useAgentState();
  const handleKurtAction = async (action: string) => {
    setOpen(true);
    switch (action) {
      case "quick-summary":
        addMessage({
          role: "kurt",
          text: `📋 **Contract Summary for ${candidate.name}**\n\n**Position:** ${candidate.role}\n**Salary:** ${candidate.salary}\n**Start Date:** ${candidate.startDate}\n**Notice Period:** ${candidate.noticePeriod}\n**PTO:** ${candidate.pto}\n\n**Key Points:**\n• Contract localized for ${candidate.country}\n• All required fields completed\n• Compliance clauses included\n• Ready for review and signature`,
          actionButtons: [{
            label: "Check Fields",
            action: "check-fields",
            variant: "outline"
          }, {
            label: "Export PDF",
            action: "export-pdf",
            variant: "secondary"
          }]
        });
        break;
      case "check-fields":
        addMessage({
          role: "kurt",
          text: `✅ **Field Verification Complete**\n\nAll required fields have been verified:\n• Personal Information ✓\n• Compensation Details ✓\n• Employment Terms ✓\n• Legal Clauses ✓\n\nNo missing or invalid data found. Contract is ready to proceed.`,
          actionButtons: [{
            label: "Fix Clauses",
            action: "fix-clauses",
            variant: "outline"
          }, {
            label: "Generate Summary",
            action: "quick-summary",
            variant: "secondary"
          }]
        });
        break;
      case "fix-clauses":
        addMessage({
          role: "kurt",
          text: `🔧 **Clause Analysis**\n\nI've reviewed the contract clauses for ${candidate.country}:\n\n**Overtime Pay (Clause 6):** Adjusted for local labor laws\n**IP Assignment:** Standard company policy applied\n**Notice Period:** Compliant with ${candidate.country} regulations\n\nAll clauses are optimized and compliant. Would you like me to make any specific adjustments?`,
          actionButtons: [{
            label: "Apply Changes",
            action: "apply-clause-changes",
            variant: "default"
          }, {
            label: "Review Terms",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "explain-term":
        addMessage({
          role: "kurt",
          text: `❓ **Legal Term Explanations**\n\nWhich term would you like me to explain? I can help clarify:\n• IP Assignment clauses\n• Notice period requirements\n• Compensation structures\n• PTO policies\n• Termination conditions\n\nJust ask about any specific term in the contract.`,
          actionButtons: [{
            label: "Explain IP Rights",
            action: "explain-ip",
            variant: "outline"
          }, {
            label: "Explain Notice Period",
            action: "explain-notice",
            variant: "outline"
          }]
        });
        break;
      case "apply-clause-changes":
        toast.success("Clause improvements applied to contract");
        addMessage({
          role: "kurt",
          text: `✅ **Changes Applied**\n\nI've updated the contract clauses. All improvements have been saved.`,
          actionButtons: [{
            label: "View Changes",
            action: "show-diff",
            variant: "default"
          }]
        });
        break;
      case "export-pdf":
        toast.success("Exporting contract as PDF...");
        addMessage({
          role: "kurt",
          text: `📄 **PDF Export**\n\nGenerating PDF for ${candidate.name}'s contract...`
        });
        break;
      case "explain-ip":
        addMessage({
          role: "kurt",
          text: `📚 **IP Assignment Clause**\n\nIntellectual Property (IP) assignment means that any work, inventions, or creative output produced during employment automatically belongs to the company.\n\n**Key Points:**\n• Work-related creations are company property\n• Includes code, designs, documentation, and inventions\n• Standard practice in employment contracts\n• Protects company's business interests`,
          actionButtons: [{
            label: "Explain Another Term",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "explain-notice":
        addMessage({
          role: "kurt",
          text: `📚 **Notice Period**\n\nThe notice period (${candidate.noticePeriod}) is the advance warning required before employment ends.\n\n**Key Points:**\n• Must be given by either party\n• Allows for transition and handover\n• Compliant with ${candidate.country} labor laws\n• Standard for ${candidate.role} positions`,
          actionButtons: [{
            label: "Explain Another Term",
            action: "explain-term",
            variant: "outline"
          }]
        });
        break;
      case "compare-drafts":
        addMessage({
          role: "kurt",
          text: `📝 **Draft Comparison**\n\nComparing V2 and V3 of ${candidate.name.split(' ')[0]}'s contract:\n\n**Changes Found:**\n• Clause 8 (Overtime): Updated rate from 1.25x to 1.5x\n• Clause 12 (Benefits): Added health insurance coverage\n• Section 4 (Notice Period): Changed from 2 weeks to 30 days\n\nAll other clauses remain unchanged.`,
          actionButtons: [{
            label: "View Full Diff",
            action: "show-diff",
            variant: "outline"
          }]
        });
        break;
      case "show-diff":
        toast.info("Showing full diff view...");
        addMessage({
          role: "kurt",
          text: "Opening detailed diff viewer with side-by-side comparison..."
        });
        break;
      case "ask-kurt":
        addMessage({
          role: "kurt",
          text: `👋 **How can I help?**\n\nI can assist you with:\n• Quick contract summaries\n• Field verification\n• Clause explanations\n• Compliance checks\n• Term clarifications\n\nWhat would you like to know about ${candidate.name.split(' ')[0]}'s contract?`,
          actionButtons: [{
            label: "Quick Summary",
            action: "quick-summary",
            variant: "default"
          }, {
            label: "Check Fields",
            action: "check-fields",
            variant: "outline"
          }]
        });
        break;
      default:
        addMessage({
          role: "kurt",
          text: `Processing: ${action}`
        });
    }
  };

  // Expose handleKurtAction globally so action buttons can call it
  useEffect(() => {
    (window as any).handleKurtAction = handleKurtAction;
    return () => {
      delete (window as any).handleKurtAction;
    };
  }, [candidate, handleKurtAction]);

  // Carousel pages
  const carouselPages = [{
    id: "summary",
    title: "Page 1: Summary & Compensation",
    content: <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Position</p>
              <p className="text-sm font-medium text-foreground">{candidate.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Salary</p>
              <p className="text-sm font-medium text-foreground">{candidate.salary}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium text-foreground">{candidate.startDate}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">PTO</p>
              <p className="text-sm font-medium text-foreground">{candidate.pto}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Benefits Package</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Briefcase className="h-3 w-3 text-primary" />
                <span className="text-foreground">Standard health coverage</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-foreground">Professional development budget</span>
              </div>
            </div>
          </div>
        </div>
  }, {
    id: "legal",
    title: "Page 2: Legal & Compliance Clauses",
    content: <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">Overtime Pay</p>
              <p className="text-xs text-muted-foreground">
                Overtime compensation follows {candidate.country} labor law standards.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">IP Assignment</p>
              <p className="text-xs text-muted-foreground">
                All intellectual property created during employment belongs to the company.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-medium text-foreground mb-2">Notice Period</p>
              <p className="text-xs text-muted-foreground">
                {candidate.noticePeriod} notice required as per local regulations.
              </p>
            </div>
          </div>
        </div>
  }, {
    id: "signoff",
    title: "Page 3: Sign-off & Signatures",
    content: <div className="space-y-4">
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-medium text-foreground mb-2">Employer Signature</p>
            <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
              <span className="text-sm italic text-muted-foreground">Company Representative</span>
            </div>
            <p className="text-xs text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-xs font-medium text-foreground mb-2">Employee Signature</p>
            <div className="h-16 border-b-2 border-dashed border-border mb-2 flex items-end pb-2">
              <span className="text-sm italic text-muted-foreground">{candidate.name}</span>
            </div>
            <p className="text-xs text-muted-foreground">To be signed via: {candidate.signingPortal}</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/5 border border-success/20">
            <FileText className="h-4 w-4 text-success" />
            <p className="text-xs text-muted-foreground">Contract ready for signature</p>
          </div>
        </div>
  }];
  // Candidate stepper component - only show when there's more than one candidate
  const candidateStepper = total > 1 ? (
    <div className="flex items-center justify-center gap-3">
      <span className="text-sm text-muted-foreground">Candidate</span>
      <span className="text-lg font-bold text-foreground">{index + 1}</span>
      <span className="text-sm text-muted-foreground">/ {total}</span>
      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden ml-1">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-300" 
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  ) : null;

  return <div className="space-y-6">
      <AgentHeader 
        title={`Reviewing ${candidate.name.split(' ')[0]}'s Contract for ${candidate.country}`} 
        subtitle="Preview how this contract will appear to the candidate before sending for signature." 
        showPulse={true} 
        isActive={isAgentSpeaking} 
        showInput={false}
        progressIndicator={candidateStepper}
      />
      <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      duration: 0.3
    }} className="h-full flex gap-4 items-start">
      {/* Left: Candidate card + Audit Log - Flex column with max height matching right panel */}
      <motion.div initial={{
        x: -20,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.1,
        duration: 0.3
      }} className="w-80 flex-shrink-0 flex flex-col h-[600px]">
        {/* Worker card - stays compact, doesn't stretch */}
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
        
        {/* Audit Log - expands until it hits the agreement height, then scrolls */}
        <div ref={auditLogSlotRef} className="flex-1 min-h-0 overflow-hidden">
          <ContractAuditLog
            contractId={contractId}
            workerName={candidate.name}
            editEvents={editEvents}
            maxHeightPx={auditLogSlotHeight}
          />
        </div>
      </motion.div>

      {/* Right: Contract editor */}
      <motion.div initial={{
        x: 20,
        opacity: 0
      }} animate={{
        x: 0,
        opacity: 1
      }} transition={{
        delay: 0.2,
        duration: 0.3
      }} className="flex-1 flex flex-col h-[600px] min-h-0">
        {/* Info message */}
        <motion.div initial={{
          opacity: 0,
          scale: 0.95
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: 0.3,
          duration: 0.3
        }} className="rounded-lg border border-border bg-muted/30 p-4 mb-4 flex-shrink-0 text-center">
          <p className="text-sm text-foreground">This contract uses a legally verified template — just review the details and you're good to go.</p>
        </motion.div>

        {/* Scrollable contract content */}
        <div
          ref={scrollAreaRef}
          className="flex-1 min-h-0 overflow-y-auto rounded-t-lg border border-b-0 border-border bg-background"
        >
          <AnimatePresence mode="wait">
            <motion.div key={activeDocument} initial={{
              opacity: 0,
              x: 20
            }} animate={{
              opacity: 1,
              x: 0
            }} exit={{
              opacity: 0,
              x: -20
            }} transition={{
              duration: 0.2
            }}>
              <div className="p-6">
                <div className="space-y-4 select-none">
                  {fullContent.map((section, idx) => <div key={idx}>
                      {section.heading && <h3 className={`${idx === 0 ? 'text-lg font-medium mb-4 text-center' : 'text-sm font-medium mb-2'} text-foreground`}>
                          {section.heading}
                        </h3>}
                      {section.text && <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                          {renderHighlightedText(section.text)}
                        </p>}
                    </div>)}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons below document - always visible */}
        <div className="flex-shrink-0 p-4 flex gap-3 justify-between items-center bg-background border border-t-0 border-border rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => {
              scrollAgreementToTop();
              onPrevious();
            }}
            size="lg"
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {!hasScrolledToBottom && (
              <span className="text-xs text-muted-foreground">Scroll to bottom to confirm</span>
            )}
            <Button
              onClick={() => {
                scrollAgreementToTop();
                onNext();
              }}
              size="lg"
              disabled={!hasScrolledToBottom}
            >
              {index === total - 1 ? "Confirm & Continue" : "Confirm"}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
    </div>;
};