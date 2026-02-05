 /**
  * F1v4_ExceptionsStep - Enhanced exception queue with 4 v1 exception types
  * 
  * Exception types:
  * - End date within payroll window
  * - Pay significantly differs from last period
  * - EOR currency mismatch
  * - Active employee missing from run
  */
 
 import React, { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { 
   CheckCircle2,
   Calendar,
   TrendingUp,
   Coins,
   UserPlus,
   Eye,
   ChevronDown,
   ChevronUp,
   X,
   ArrowRight,
 } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Badge } from "@/components/ui/badge";
 import { Avatar, AvatarFallback } from "@/components/ui/avatar";
 import { Card, CardContent } from "@/components/ui/card";
 import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
 import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
 import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
 import { Textarea } from "@/components/ui/textarea";
 import { Separator } from "@/components/ui/separator";
 import { cn } from "@/lib/utils";
 import { toast } from "@/hooks/use-toast";
 import { CompanyPayrollData } from "./F1v4_PayrollTab";
 
 export type ExceptionCategory = "end_date" | "pay_delta" | "currency_mismatch" | "missing_from_run";
 export type ExceptionStatus = "active" | "skipped" | "overridden";
 
 export interface WorkerProfile {
   country: string;
   type: "employee" | "contractor";
   basePay: number;
   currency: string;
   status: string;
   endDate?: string;
   lastPeriodPay?: number;
   expectedCurrency?: string;
 }
 
 export interface WorkerException {
   id: string;
   workerId: string;
   workerName: string;
   workerCountry: string;
   category: ExceptionCategory;
   status: ExceptionStatus;
   shortDescription: string;
   detailedExplanation: string;
   recommendation: string;
   profile: WorkerProfile;
   deltaAmount?: number;
   deltaPercentage?: number;
   salaryCurrency?: string;
   countryCurrency?: string;
 }
 
 type ReasonChip = "Termination timing" | "Payroll timing" | "One-off adjustment" | "Data mismatch" | "Missing info" | "Other";
 
 const REASON_CHIPS: ReasonChip[] = [
   "Termination timing",
   "Payroll timing", 
   "One-off adjustment",
   "Data mismatch",
   "Missing info",
   "Other"
 ];
 
 interface F1v4_ExceptionsStepProps {
   company: CompanyPayrollData;
   exceptionsCount: number;
   onResolve: () => void;
   onContinue: () => void;
   hideHeader?: boolean;
 }
 
 const MOCK_EXCEPTIONS: WorkerException[] = [
   {
     id: "exc-1",
     workerId: "4",
     workerName: "Alex Hansen",
     workerCountry: "Norway",
     category: "end_date",
     status: "active",
     shortDescription: "End date within payroll window",
     detailedExplanation: "Alex Hansen's contract end date (Jan 15, 2026) falls within the current payroll period. Verify whether this worker should be included in this run or if proration is needed.",
     recommendation: "Review the worker's final pay date and ensure any prorated amounts are correct before including.",
     profile: {
       country: "Norway",
       type: "employee",
       basePay: 65000,
       currency: "NOK",
       status: "Ending",
       endDate: "Jan 15, 2026",
     },
   },
   {
     id: "exc-2",
     workerId: "3",
     workerName: "Maria Santos",
     workerCountry: "Philippines",
     category: "pay_delta",
     status: "active",
     shortDescription: "Pay significantly differs from last period",
     detailedExplanation: "Net pay changed vs last run: +₱42,000 (+18%). This is a notable increase from the previous period. Confirm if this change is expected (bonus, expense, adjustment).",
     recommendation: "Verify any approved bonuses, overtime, or expense submissions that explain the delta.",
     deltaAmount: 42000,
     deltaPercentage: 18,
     profile: {
       country: "Philippines",
       type: "employee",
       basePay: 280000,
       currency: "PHP",
       status: "Active",
       lastPeriodPay: 238000,
     },
   },
   {
     id: "exc-3",
     workerId: "6",
     workerName: "Emma Wilson",
     workerCountry: "Singapore",
     category: "currency_mismatch",
     status: "active",
     shortDescription: "Salary currency ≠ expected country currency",
     detailedExplanation: "This worker's salary is set in USD, but the expected currency for Singapore-based EOR workers is SGD. This may cause FX discrepancies or compliance issues.",
     recommendation: "Confirm if USD invoicing is intentional or if the currency should be updated to SGD.",
     salaryCurrency: "USD",
     countryCurrency: "SGD",
     profile: {
       country: "Singapore",
       type: "contractor",
       basePay: 8500,
       currency: "USD",
       status: "Active",
       expectedCurrency: "SGD",
     },
   },
   {
     id: "exc-4",
     workerId: "8",
     workerName: "Liam O'Connor",
     workerCountry: "Ireland",
     category: "missing_from_run",
     status: "active",
     shortDescription: "Active worker missing from run",
     detailedExplanation: "Liam O'Connor is marked as an active employee but is not included in the current payroll run. This may be an oversight or intentional exclusion.",
     recommendation: "Add to run if the worker should be paid this period, or skip with a documented reason.",
     profile: {
       country: "Ireland",
       type: "employee",
       basePay: 4800,
       currency: "EUR",
       status: "Active",
     },
   },
   {
     id: "exc-5",
     workerId: "9",
     workerName: "Juan dela Cruz",
     workerCountry: "Philippines",
     category: "end_date",
     status: "active",
     shortDescription: "End date within payroll window",
     detailedExplanation: "Juan dela Cruz's end date is Jan 20, 2026. In PH fortnightly schedules, a worker may still be paid after end date depending on payout timing. Review before excluding.",
     recommendation: "Check the PH payroll calendar to confirm if this worker should receive payment in this run.",
     profile: {
       country: "Philippines",
       type: "employee",
       basePay: 85000,
       currency: "PHP",
       status: "Ending",
       endDate: "Jan 20, 2026",
     },
   },
 ];
 
 const categoryConfig: Record<ExceptionCategory, { icon: React.ElementType; label: string; tagColor: string }> = {
   end_date: { icon: Calendar, label: "End date", tagColor: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
   pay_delta: { icon: TrendingUp, label: "Pay delta", tagColor: "bg-blue-500/15 text-blue-700 border-blue-500/30" },
   currency_mismatch: { icon: Coins, label: "Currency mismatch", tagColor: "bg-purple-500/15 text-purple-700 border-purple-500/30" },
   missing_from_run: { icon: UserPlus, label: "Missing from run", tagColor: "bg-red-500/15 text-red-700 border-red-500/30" },
 };
 
 const countryFlags: Record<string, string> = {
   Norway: "🇳🇴", Philippines: "🇵🇭", Singapore: "🇸🇬", Spain: "🇪🇸",
   Portugal: "🇵🇹", Germany: "🇩🇪", France: "🇫🇷", Ireland: "🇮🇪",
   UK: "🇬🇧", USA: "🇺🇸", Japan: "🇯🇵", India: "🇮🇳",
 };
 
 export const F1v4_ExceptionsStep: React.FC<F1v4_ExceptionsStepProps> = ({
   company,
   exceptionsCount,
   onResolve,
   onContinue,
   hideHeader = false,
 }) => {
   const [exceptions, setExceptions] = useState<WorkerException[]>(MOCK_EXCEPTIONS);
   const [showResolved, setShowResolved] = useState(false);
   const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
   const [actionType, setActionType] = useState<"skip" | "override" | null>(null);
   const [selectedReason, setSelectedReason] = useState<ReasonChip | null>(null);
   const [additionalNotes, setAdditionalNotes] = useState("");
 
   const activeExceptions = exceptions.filter(e => e.status === "active");
   const resolvedExceptions = exceptions.filter(e => e.status === "skipped" || e.status === "overridden");
   const selectedExceptionData = exceptions.find(e => e.id === selectedExceptionId);
 
   const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
 
   const openDrawer = (exceptionId: string) => {
     setSelectedExceptionId(exceptionId);
     setActionType(null);
     setSelectedReason(null);
     setAdditionalNotes("");
   };
 
   const closeDrawer = () => {
     setSelectedExceptionId(null);
     setActionType(null);
     setSelectedReason(null);
     setAdditionalNotes("");
   };
 
   const handleQuickSkip = (exceptionId: string) => {
     setSelectedExceptionId(exceptionId);
     setActionType("skip");
   };
 
   const handleQuickOverride = (exceptionId: string) => {
     setSelectedExceptionId(exceptionId);
     setActionType("override");
   };
 
   const confirmAction = () => {
     if (!selectedExceptionId || !actionType || !selectedReason) return;
 
     const workerName = exceptions.find(e => e.id === selectedExceptionId)?.workerName || "";
     const newStatus: ExceptionStatus = actionType === "skip" ? "skipped" : "overridden";
     
     setExceptions(prev => prev.map(e => 
       e.id === selectedExceptionId ? { ...e, status: newStatus } : e
     ));
     
     if (actionType === "skip") {
       toast({ description: `Skipped: ${workerName}` });
     } else {
       toast({ description: `Override confirmed — ${workerName} included in run` });
     }
     
     onResolve();
     closeDrawer();
   };
 
   const canContinue = activeExceptions.length === 0;
 
   const formatCurrency = (amount: number, currency: string) => {
     const symbols: Record<string, string> = { NOK: "kr", PHP: "₱", EUR: "€", SGD: "S$", USD: "$", GBP: "£", JPY: "¥", INR: "₹" };
     return `${symbols[currency] || currency}${amount.toLocaleString()}`;
   };
 
   const renderExceptionRow = (exception: WorkerException, isResolved: boolean = false) => {
     const config = categoryConfig[exception.category];
     const CategoryIcon = config.icon;
 
     return (
       <motion.div
         key={exception.id}
         layout
         initial={{ opacity: 0, y: -8 }}
         animate={{ opacity: 1, y: 0 }}
         exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
         className={cn(
           "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group",
           isResolved 
             ? "bg-muted/30 border-border/40"
             : "bg-card border-border/60 hover:border-border hover:shadow-sm"
         )}
       >
         <Avatar className="h-9 w-9 flex-shrink-0">
           <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
             {getInitials(exception.workerName)}
           </AvatarFallback>
         </Avatar>
         
         <div className="flex-1 min-w-0 space-y-1">
           <div className="flex items-center gap-2 flex-wrap">
             <span className={cn("text-sm font-medium truncate", isResolved && "text-muted-foreground")}>
               {exception.workerName}
             </span>
             <span className="text-xs text-muted-foreground">
               {countryFlags[exception.workerCountry]} {exception.workerCountry}
             </span>
             <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 h-5", config.tagColor)}>
               <CategoryIcon className="h-3 w-3 mr-1" />
               {config.label}
             </Badge>
             {isResolved && (
               <Badge 
                 variant="outline" 
                 className={cn(
                   "text-[10px] px-1.5 py-0 h-5",
                   exception.status === "overridden" 
                     ? "bg-primary/10 text-primary border-primary/30" 
                     : "bg-muted text-muted-foreground border-border"
                 )}
               >
                 {exception.status === "overridden" ? "Overridden" : "Skipped"}
               </Badge>
             )}
           </div>
           <div className={cn("text-xs truncate", isResolved ? "text-muted-foreground/60" : "text-muted-foreground")}>
             {exception.shortDescription}
           </div>
         </div>
 
         {!isResolved && (
           <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
             <Button
               variant="ghost"
               size="sm"
               onClick={(e) => { e.stopPropagation(); handleQuickSkip(exception.id); }}
               className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
             >
               Skip
             </Button>
             <Button
               variant="secondary"
               size="sm"
               onClick={(e) => { e.stopPropagation(); handleQuickOverride(exception.id); }}
               className="h-7 px-2 text-xs"
             >
               Override
             </Button>
             <Button
               variant="outline"
               size="sm"
               onClick={() => openDrawer(exception.id)}
               className="h-7 px-2 text-xs gap-1"
             >
               <Eye className="h-3 w-3" />
               Review
             </Button>
           </div>
         )}
       </motion.div>
     );
   };
 
   const renderCategoryDetail = (exception: WorkerException) => {
     switch (exception.category) {
       case "end_date":
         return (
           <div className="space-y-3">
             <div className="flex items-center justify-between py-2">
               <span className="text-sm text-muted-foreground">End date</span>
               <span className="text-sm font-medium">{exception.profile.endDate}</span>
             </div>
             {exception.workerCountry === "Philippines" && (
               <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                 <p className="text-xs text-amber-700">
                   <strong>PH Note:</strong> In fortnightly schedules, a worker may still be paid after end date depending on payout timing. Review before excluding.
                 </p>
               </div>
             )}
           </div>
         );
       case "pay_delta":
         return (
           <div className="space-y-3">
             <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
               <div className="text-center">
                 <span className="text-2xl font-semibold text-blue-600">
                   {exception.deltaPercentage && exception.deltaPercentage > 0 ? "+" : ""}
                   {formatCurrency(exception.deltaAmount || 0, exception.profile.currency)}
                 </span>
                 <span className="text-sm text-blue-600 ml-2">
                   ({exception.deltaPercentage && exception.deltaPercentage > 0 ? "+" : ""}{exception.deltaPercentage}%)
                 </span>
               </div>
               <p className="text-xs text-center text-muted-foreground mt-1">vs last period</p>
             </div>
             <div className="flex items-center justify-between py-2">
               <span className="text-sm text-muted-foreground">Last period pay</span>
               <span className="text-sm font-medium">{formatCurrency(exception.profile.lastPeriodPay || 0, exception.profile.currency)}</span>
             </div>
           </div>
         );
       case "currency_mismatch":
         return (
           <div className="space-y-3">
             <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-center gap-4">
               <div className="text-center">
                 <span className="text-lg font-semibold">{exception.salaryCurrency}</span>
                 <p className="text-xs text-muted-foreground">Salary currency</p>
               </div>
               <ArrowRight className="h-4 w-4 text-muted-foreground" />
               <div className="text-center">
                 <span className="text-lg font-semibold text-purple-600">{exception.countryCurrency}</span>
                 <p className="text-xs text-muted-foreground">Expected currency</p>
               </div>
             </div>
           </div>
         );
       case "missing_from_run":
         return (
           <div className="space-y-3">
             <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
               <p className="text-xs text-red-700">
                 This worker is marked as <strong>Active</strong> but is not included in the current payroll run.
               </p>
             </div>
           </div>
         );
       default:
         return null;
     }
   };
 
   const renderDetailDrawer = () => {
     if (!selectedExceptionData || actionType) return null;
 
     const config = categoryConfig[selectedExceptionData.category];
     const CategoryIcon = config.icon;
 
     return (
       <Sheet open={!!selectedExceptionId && !actionType} onOpenChange={(open) => !open && closeDrawer()}>
         <SheetContent className="w-full sm:max-w-md overflow-y-auto">
           <SheetHeader className="pb-4">
             <SheetTitle className="text-lg font-semibold">Exception Details</SheetTitle>
           </SheetHeader>
 
           <div className="space-y-6">
             <div className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/40">
               <Avatar className="h-11 w-11">
                 <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                   {getInitials(selectedExceptionData.workerName)}
                 </AvatarFallback>
               </Avatar>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2">
                   <span className="font-medium">{selectedExceptionData.workerName}</span>
                   <span className="text-sm">{countryFlags[selectedExceptionData.workerCountry]}</span>
                 </div>
                 <div className="flex items-center gap-2 mt-1 flex-wrap">
                   <Badge variant="outline" className="text-[10px]">
                     {selectedExceptionData.profile.type === "employee" ? "Employee" : "Contractor"}
                   </Badge>
                   <Badge variant="outline" className="text-[10px]">
                     {selectedExceptionData.profile.status}
                   </Badge>
                 </div>
                 <div className="text-sm text-muted-foreground mt-2">
                   Base: {formatCurrency(selectedExceptionData.profile.basePay, selectedExceptionData.profile.currency)}/mo
                 </div>
               </div>
             </div>
 
             <Badge variant="outline" className={cn("text-xs px-2 py-1", config.tagColor)}>
               <CategoryIcon className="h-3.5 w-3.5 mr-1.5" />
               {config.label}
             </Badge>
 
             <div className="space-y-2">
               <h4 className="text-sm font-medium">Why you're seeing this</h4>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 {selectedExceptionData.detailedExplanation}
               </p>
             </div>
 
             {renderCategoryDetail(selectedExceptionData)}
 
             <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
               <p className="text-xs text-primary/80">
                 <strong>Recommendation:</strong> {selectedExceptionData.recommendation}
               </p>
             </div>
 
             <Separator />
 
             <div className="space-y-3">
               <h4 className="text-sm font-medium">Actions</h4>
               <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   className="flex-1"
                   onClick={() => { closeDrawer(); handleQuickSkip(selectedExceptionData.id); }}
                 >
                   Skip this run
                 </Button>
                 <Button 
                   variant="default" 
                   className="flex-1"
                   onClick={() => { closeDrawer(); handleQuickOverride(selectedExceptionData.id); }}
                 >
                   {selectedExceptionData.category === "missing_from_run" ? "Add to run" : "Override & include"}
                 </Button>
               </div>
             </div>
           </div>
         </SheetContent>
       </Sheet>
     );
   };
 
   const renderReasonModal = () => {
     if (!selectedExceptionId || !actionType) return null;
     const exception = exceptions.find(e => e.id === selectedExceptionId);
     if (!exception || exception.status !== "active") return null;
 
     return (
       <Sheet open={!!actionType} onOpenChange={(open) => !open && closeDrawer()}>
         <SheetContent className="w-full sm:max-w-sm">
           <SheetHeader className="pb-4">
             <SheetTitle className="text-base font-semibold">
               {actionType === "skip" ? "Skip" : "Override"}: {exception.workerName}
             </SheetTitle>
           </SheetHeader>
 
           <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="space-y-4"
           >
             <div>
               <h4 className="text-sm font-medium mb-3">
                 Reason <span className="text-destructive">*</span>
               </h4>
               
               <div className="flex flex-wrap gap-2">
                 {REASON_CHIPS.map((chip) => (
                   <button
                     key={chip}
                     onClick={() => setSelectedReason(chip)}
                     className={cn(
                       "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                       selectedReason === chip
                         ? "bg-primary text-primary-foreground border-primary"
                         : "bg-muted/50 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                     )}
                   >
                     {chip}
                   </button>
                 ))}
               </div>
             </div>
 
             <div className="space-y-2">
               <label className="text-xs text-muted-foreground">Additional notes (optional)</label>
               <Textarea
                 placeholder="Add any additional context..."
                 value={additionalNotes}
                 onChange={(e) => setAdditionalNotes(e.target.value)}
                 className="min-h-[80px] text-sm resize-none"
               />
             </div>
 
             <div className="flex gap-2 pt-2">
               <Button variant="outline" onClick={closeDrawer} className="flex-1">
                 Cancel
               </Button>
               <Button 
                 onClick={confirmAction}
                 disabled={!selectedReason}
                 className="flex-1"
               >
                 {actionType === "skip" ? "Confirm Skip" : "Confirm Override"}
               </Button>
             </div>
           </motion.div>
         </SheetContent>
       </Sheet>
     );
   };
 
   const renderContent = () => (
    <div className="space-y-2">
       {activeExceptions.length === 0 && resolvedExceptions.length === 0 && (
         <div className="py-12 flex flex-col items-center gap-3 text-center">
           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
             <CheckCircle2 className="h-6 w-6 text-primary" />
           </div>
           <div>
             <p className="font-medium text-foreground">All clear</p>
             <p className="text-sm text-muted-foreground">No exceptions detected for this payroll run.</p>
           </div>
         </div>
       )}
 
       {activeExceptions.length > 0 && (
         <div className="space-y-2">
           <AnimatePresence mode="popLayout">
             {activeExceptions.map(exc => renderExceptionRow(exc, false))}
           </AnimatePresence>
         </div>
       )}
 
       {activeExceptions.length === 0 && resolvedExceptions.length > 0 && (
         <div className="py-6 flex flex-col items-center gap-2 text-center">
           <CheckCircle2 className="h-6 w-6 text-primary" />
           <p className="text-sm font-medium text-foreground">All exceptions resolved</p>
           <p className="text-xs text-muted-foreground">Ready to continue to approval</p>
         </div>
       )}
 
       {resolvedExceptions.length > 0 && (
         <Collapsible open={showResolved} onOpenChange={setShowResolved}>
           <CollapsibleTrigger asChild>
             <button className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30 transition-colors text-xs text-muted-foreground border border-border/40">
               <span className="flex items-center gap-1.5">
                 <CheckCircle2 className="h-3.5 w-3.5" />
                 {resolvedExceptions.length} resolved
               </span>
               {showResolved ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
             </button>
           </CollapsibleTrigger>
           <CollapsibleContent className="space-y-2 pt-2">
             <AnimatePresence mode="popLayout">
               {resolvedExceptions.map(exc => renderExceptionRow(exc, true))}
             </AnimatePresence>
           </CollapsibleContent>
         </Collapsible>
       )}
 
       {renderReasonModal()}
       {renderDetailDrawer()}
     </div>
   );
 
   if (hideHeader) {
     return renderContent();
   }
 
   return (
     <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm overflow-visible">
       <CardContent className="p-5">
         {renderContent()}
       </CardContent>
     </Card>
   );
 };
 
 export default F1v4_ExceptionsStep;