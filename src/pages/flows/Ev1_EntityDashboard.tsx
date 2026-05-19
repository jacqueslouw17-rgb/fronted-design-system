/**
 * Flow 7 — Entity Dashboard v1
 *
 * Unified Client / Company Entity Dashboard for Fronted Admins.
 * Replaces the previous tabbed v7 clone with a single operating-layer view.
 *
 * ISOLATED: This file is independent of any other flow.
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileText,
  Globe2,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Workflow,
  X,
  Clock,
  AlertCircle,
  Circle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import frontedLogo from "@/assets/fronted-logo.png";

// Brand palette — Fronted entity.fronted.com (cream + ink, pastel pink & mint)
const BRAND = {
  cream: "hsl(42 22% 93%)",
  creamDeep: "hsl(40 18% 88%)",
  ink: "hsl(0 0% 7%)",
  pink: "hsl(2 55% 90%)",
  pinkDeep: "hsl(2 60% 78%)",
  mint: "hsl(120 28% 86%)",
  mintDeep: "hsl(140 30% 62%)",
  sand: "hsl(36 28% 80%)",
  lavender: "hsl(265 45% 86%)",
};

const CHART = {
  primary: BRAND.ink,
  primaryFade: "hsl(0 0% 7% / 0.10)",
  ok: BRAND.mintDeep,
  warn: BRAND.pinkDeep,
  info: "hsl(200 35% 55%)",
  muted: "hsl(40 10% 72%)",
  ink: BRAND.ink,
};

// ────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────

type EntityStage =
  | "intake"
  | "details"
  | "setup"
  | "payroll"
  | "compliance"
  | "active";

type ChecklistStatus =
  | "not-started"
  | "in-progress"
  | "waiting-client"
  | "done";

interface ChecklistItem {
  label: string;
  status: ChecklistStatus;
}

interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}

interface EntityRecord {
  id: string;
  company: string;
  country: string;
  flag: string;
  stage: EntityStage;
  entityStatus: string;
  workers: number;
  employeesPlanned: number;
  currentEor: boolean;
  missingItems: string[];
  owner: string;
  nextAction: string;
  lastUpdated: string;
  entityType: string;
  goLive: string;
  clientContact: { name: string; email: string };
  intake: {
    avgSalary: string;
    currentEorCost: string;
    hiringTimeline: string;
    alreadyHiring: boolean;
    notes: string;
  };
  checklist: ChecklistGroup[];
  documents: string[];
  timeline: { label: string; date: string; done: boolean }[];
}

// ────────────────────────────────────────────────────────────────
// Mock data
// ────────────────────────────────────────────────────────────────

const STAGES: { key: EntityStage; label: string; description: string }[] = [
  { key: "intake", label: "Intake received", description: "Client submitted entity setup request." },
  { key: "details", label: "Details requested", description: "Fronted has requested missing details." },
  { key: "setup", label: "Setup coordination", description: "Entity setup is underway with local partner." },
  { key: "payroll", label: "Payroll setup", description: "Payroll registration and rules are being configured." },
  { key: "compliance", label: "Compliance review", description: "Local compliance and approvals are being reviewed." },
  { key: "active", label: "Active entity", description: "Entity is live and operational." },
];

const buildChecklist = (overrides: Partial<Record<string, ChecklistStatus>> = {}): ChecklistGroup[] => {
  const def = (label: string, fallback: ChecklistStatus): ChecklistItem => ({
    label,
    status: overrides[label] ?? fallback,
  });
  return [
    {
      title: "Entity setup",
      items: [
        def("Company details collected", "done"),
        def("Entity path confirmed", "done"),
        def("Local partner assigned", "in-progress"),
        def("Registration started", "in-progress"),
        def("Registration complete", "not-started"),
      ],
    },
    {
      title: "Payroll setup",
      items: [
        def("Payroll partner confirmed", "in-progress"),
        def("Pay cycle confirmed", "waiting-client"),
        def("Payroll rules configured", "not-started"),
        def("First payroll date confirmed", "waiting-client"),
      ],
    },
    {
      title: "Compliance",
      items: [
        def("Required documents confirmed", "in-progress"),
        def("Local compliance reviewed", "not-started"),
        def("Local filings understood", "not-started"),
        def("Sign-off complete", "not-started"),
      ],
    },
    {
      title: "Accounting",
      items: [
        def("Accounting partner assigned", "not-started"),
        def("Reporting requirements confirmed", "not-started"),
        def("Bookkeeping process confirmed", "not-started"),
      ],
    },
    {
      title: "Worker payroll admin",
      items: [
        def("Workers imported / added", "in-progress"),
        def("Missing worker details collected", "waiting-client"),
        def("Workers payroll-ready", "not-started"),
      ],
    },
  ];
};

const ENTITIES: EntityRecord[] = [
  {
    id: "acme-sg",
    company: "Acme Corp",
    country: "Singapore",
    flag: "🇸🇬",
    stage: "payroll",
    entityStatus: "In setup",
    workers: 5,
    employeesPlanned: 8,
    currentEor: true,
    missingItems: ["First payroll date", "Local signatory info"],
    owner: "Maya Lin",
    nextAction: "Confirm first payroll date",
    lastUpdated: "2 hours ago",
    entityType: "Private Limited (Pte Ltd)",
    goLive: "1 Mar 2026",
    clientContact: { name: "Hannah Reyes", email: "hannah@acme.com" },
    intake: {
      avgSalary: "SGD 7,500 / mo",
      currentEorCost: "USD 9,200 / mo",
      hiringTimeline: "Within 60 days",
      alreadyHiring: true,
      notes: "Wants to move 5 EOR contracts to direct entity by Q2.",
    },
    checklist: buildChecklist({
      "First payroll date confirmed": "waiting-client",
    }),
    documents: [
      "Entity registration documents",
      "Local compliance documents",
      "Payroll registration documents",
    ],
    timeline: [
      { label: "Intake received", date: "10 Dec 2025", done: true },
      { label: "Details requested", date: "12 Dec 2025", done: true },
      { label: "Client responded", date: "18 Dec 2025", done: true },
      { label: "Setup started", date: "5 Jan 2026", done: true },
      { label: "Payroll setup started", date: "20 Jan 2026", done: true },
      { label: "Compliance review", date: "—", done: false },
      { label: "Entity activated", date: "—", done: false },
    ],
  },
  {
    id: "globex-de",
    company: "Globex Inc",
    country: "Germany",
    flag: "🇩🇪",
    stage: "details",
    entityStatus: "Waiting on client",
    workers: 12,
    employeesPlanned: 18,
    currentEor: true,
    missingItems: [
      "Company registration details",
      "Local signatory info",
      "Payroll cycle",
      "First payroll date",
      "Worker payroll fields",
    ],
    owner: "Daniel Park",
    nextAction: "Collect payroll and tax setup fields",
    lastUpdated: "Yesterday",
    entityType: "GmbH",
    goLive: "15 Apr 2026",
    clientContact: { name: "Sarah Park", email: "sarah@globex.com" },
    intake: {
      avgSalary: "EUR 6,400 / mo",
      currentEorCost: "USD 21,800 / mo",
      hiringTimeline: "Within 90 days",
      alreadyHiring: true,
      notes: "12 engineers on EOR today, planning 6 more hires this year.",
    },
    checklist: buildChecklist({
      "Company details collected": "in-progress",
      "Entity path confirmed": "in-progress",
      "Local partner assigned": "not-started",
      "Registration started": "not-started",
    }),
    documents: ["Client-provided setup documents"],
    timeline: [
      { label: "Intake received", date: "2 Jan 2026", done: true },
      { label: "Details requested", date: "5 Jan 2026", done: true },
      { label: "Client responded", date: "—", done: false },
      { label: "Setup started", date: "—", done: false },
    ],
  },
  {
    id: "initech-ph",
    company: "Initech Ltd",
    country: "Philippines",
    flag: "🇵🇭",
    stage: "active",
    entityStatus: "Active",
    workers: 8,
    employeesPlanned: 8,
    currentEor: false,
    missingItems: [],
    owner: "Priya Nair",
    nextAction: "Run next payroll",
    lastUpdated: "30 minutes ago",
    entityType: "Domestic Corporation",
    goLive: "1 Oct 2025",
    clientContact: { name: "Bill Lumbergh", email: "bill@initech.io" },
    intake: {
      avgSalary: "PHP 90,000 / mo",
      currentEorCost: "—",
      hiringTimeline: "Active",
      alreadyHiring: true,
      notes: "Live entity. Monthly payroll runs on the 25th.",
    },
    checklist: buildChecklist({
      "Company details collected": "done",
      "Entity path confirmed": "done",
      "Local partner assigned": "done",
      "Registration started": "done",
      "Registration complete": "done",
      "Payroll partner confirmed": "done",
      "Pay cycle confirmed": "done",
      "Payroll rules configured": "done",
      "First payroll date confirmed": "done",
      "Required documents confirmed": "done",
      "Local compliance reviewed": "done",
      "Local filings understood": "done",
      "Sign-off complete": "done",
      "Accounting partner assigned": "done",
      "Reporting requirements confirmed": "done",
      "Bookkeeping process confirmed": "done",
      "Workers imported / added": "done",
      "Missing worker details collected": "done",
      "Workers payroll-ready": "done",
    }),
    documents: [
      "Entity registration documents",
      "Local compliance documents",
      "Payroll registration documents",
      "Accounting handoff documents",
    ],
    timeline: [
      { label: "Intake received", date: "1 Jun 2025", done: true },
      { label: "Details requested", date: "5 Jun 2025", done: true },
      { label: "Client responded", date: "12 Jun 2025", done: true },
      { label: "Setup started", date: "20 Jun 2025", done: true },
      { label: "Payroll setup started", date: "15 Aug 2025", done: true },
      { label: "Compliance review", date: "10 Sep 2025", done: true },
      { label: "Entity activated", date: "1 Oct 2025", done: true },
    ],
  },
  {
    id: "waystar-se",
    company: "Waystar Royco",
    country: "Sweden",
    flag: "🇸🇪",
    stage: "setup",
    entityStatus: "In setup",
    workers: 15,
    employeesPlanned: 20,
    currentEor: true,
    missingItems: ["Local accounting partner", "Bookkeeping process", "Reporting requirements"],
    owner: "Lars Holm",
    nextAction: "Assign local accounting partner",
    lastUpdated: "3 days ago",
    entityType: "Aktiebolag (AB)",
    goLive: "1 Jun 2026",
    clientContact: { name: "Kendall Roy", email: "kendall@waystar.com" },
    intake: {
      avgSalary: "SEK 62,000 / mo",
      currentEorCost: "USD 32,400 / mo",
      hiringTimeline: "Within 120 days",
      alreadyHiring: true,
      notes: "Large EOR migration. Will need accounting partner immediately.",
    },
    checklist: buildChecklist({
      "Local partner assigned": "done",
      "Registration started": "in-progress",
    }),
    documents: ["Entity registration documents", "Client-provided setup documents"],
    timeline: [
      { label: "Intake received", date: "15 Nov 2025", done: true },
      { label: "Details requested", date: "20 Nov 2025", done: true },
      { label: "Client responded", date: "5 Dec 2025", done: true },
      { label: "Setup started", date: "10 Jan 2026", done: true },
      { label: "Payroll setup", date: "—", done: false },
    ],
  },
];

// Synthetic additions to fill pipeline columns (2 details, 3 setup, 4 payroll, 2 compliance, 2 active, 1 intake)
const mk = (
  id: string,
  company: string,
  country: string,
  flag: string,
  stage: EntityStage,
  entityStatus: string,
  workers: number,
  owner: string,
  nextAction: string,
  missing: string[] = [],
): EntityRecord => ({
  id,
  company,
  country,
  flag,
  stage,
  entityStatus,
  workers,
  employeesPlanned: workers + 2,
  currentEor: true,
  missingItems: missing,
  owner,
  nextAction,
  lastUpdated: "today",
  entityType: "Local entity",
  goLive: "TBC",
  clientContact: { name: "Client lead", email: "lead@" + company.toLowerCase().replace(/\s+/g, "") + ".com" },
  intake: {
    avgSalary: "—",
    currentEorCost: "—",
    hiringTimeline: "Within 90 days",
    alreadyHiring: true,
    notes: "",
  },
  checklist: buildChecklist(),
  documents: ["Entity registration documents"],
  timeline: [
    { label: "Intake received", date: "—", done: stage !== "intake" || true },
    { label: "Details requested", date: "—", done: ["details","setup","payroll","compliance","active"].includes(stage) },
    { label: "Setup", date: "—", done: ["setup","payroll","compliance","active"].includes(stage) },
    { label: "Payroll setup", date: "—", done: ["payroll","compliance","active"].includes(stage) },
    { label: "Compliance review", date: "—", done: ["compliance","active"].includes(stage) },
    { label: "Entity activated", date: "—", done: stage === "active" },
  ],
});

ENTITIES.push(
  // intake (1 total)
  mk("northwind-fr", "Northwind Co", "France", "🇫🇷", "intake", "Intake received", 3, "Maya Lin", "Review intake notes"),
  // details requested (2 total → +1)
  mk("umbrella-nl", "Umbrella Ltd", "Netherlands", "🇳🇱", "details", "Waiting on client", 6, "Sam Patel", "Send details request", ["Local signatory info"]),
  // setup coordination (3 total → +2)
  mk("hooli-ie", "Hooli Group", "Ireland", "🇮🇪", "setup", "In setup", 4, "Sam Patel", "Confirm registered office"),
  mk("vandelay-es", "Vandelay Industries", "Spain", "🇪🇸", "setup", "In setup", 9, "Maya Lin", "Notary appointment booked"),
  // payroll setup (4 total → +3)
  mk("piedpiper-pt", "Pied Piper", "Portugal", "🇵🇹", "payroll", "Payroll setup", 5, "Sam Patel", "Configure pay cycle"),
  mk("soylent-pl", "Soylent Corp", "Poland", "🇵🇱", "payroll", "Payroll setup", 7, "Maya Lin", "ZUS registration"),
  mk("massive-dk", "Massive Dynamic", "Denmark", "🇩🇰", "payroll", "Payroll setup", 4, "Sam Patel", "Tax authority filings"),
  // compliance (2 total → +2)
  mk("stark-uk", "Stark Industries", "United Kingdom", "🇬🇧", "compliance", "Compliance review", 11, "Maya Lin", "PAYE sign-off"),
  mk("wayne-au", "Wayne Enterprises", "Australia", "🇦🇺", "compliance", "Compliance review", 6, "Sam Patel", "Fair Work review"),
  // active (2 total → +1)
  mk("oscorp-se", "Oscorp", "Sweden", "🇸🇪", "active", "Active entity", 14, "Maya Lin", "Run monthly payroll"),
);

const COMPANIES = ["All companies", "Acme Corp", "Globex Inc", "Initech Ltd", "Waystar Royco"];
const COUNTRIES = ["All countries", "Singapore", "Germany", "Philippines", "Sweden"];

// ────────────────────────────────────────────────────────────────
// Service layer
// ────────────────────────────────────────────────────────────────

interface ServiceArea {
  key: string;
  icon: React.ElementType;
  title: string;
  description: string;
  statusLabel: string;
  statusTone: "ok" | "warn" | "info" | "muted";
  metrics: { label: string; value: string }[];
}

const SERVICES: ServiceArea[] = [
  {
    key: "entity-setup",
    icon: Building2,
    title: "Entity setup coordination",
    description: "Company registration, legal structure, local incorporation, and setup steps.",
    statusLabel: "In progress",
    statusTone: "info",
    metrics: [
      { label: "Setups in motion", value: "2" },
      { label: "Waiting on client", value: "1" },
    ],
  },
  {
    key: "payroll-setup",
    icon: Wallet,
    title: "Payroll setup",
    description: "Payroll registration, tax codes, pay cycles, and first payroll readiness.",
    statusLabel: "Configuring",
    statusTone: "info",
    metrics: [
      { label: "Countries configuring", value: "2" },
      { label: "Payroll ready", value: "1" },
    ],
  },
  {
    key: "compliance",
    icon: ShieldCheck,
    title: "Local compliance handling",
    description: "Filing deadlines, labour law checks, statutory requirements, and compliance reviews.",
    statusLabel: "Review needed",
    statusTone: "warn",
    metrics: [
      { label: "Open reviews", value: "1" },
      { label: "Up to date", value: "1" },
    ],
  },
  {
    key: "employee-payroll",
    icon: Users,
    title: "Employee payroll admin",
    description: "Monthly payroll runs, payslips, employee queries, and worker-level payroll support.",
    statusLabel: "Action needed",
    statusTone: "warn",
    metrics: [
      { label: "Workers ready", value: "12" },
      { label: "Missing details", value: "3" },
    ],
  },
  {
    key: "accounting",
    icon: ClipboardList,
    title: "Accounting & bookkeeping",
    description: "Local accounting partner, reporting needs, bookkeeping setup, and month-end coordination.",
    statusLabel: "Details pending",
    statusTone: "muted",
    metrics: [
      { label: "Partners assigned", value: "1" },
      { label: "Pending setup", value: "2" },
    ],
  },
  {
    key: "platform",
    icon: Workflow,
    title: "One platform workflow",
    description: "Documents, entity tasks, payroll status, costs, and operations visible in one place.",
    statusLabel: "Connected",
    statusTone: "ok",
    metrics: [
      { label: "Entities connected", value: "3" },
      { label: "Needs setup", value: "1" },
    ],
  },
];

// ────────────────────────────────────────────────────────────────
// Small UI atoms
// ────────────────────────────────────────────────────────────────

const StatusChip: React.FC<{ tone: "ok" | "warn" | "info" | "muted"; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const styles: Record<string, string> = {
    ok: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300",
    warn: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-300",
    info: "bg-sky-500/10 text-sky-700 border-sky-500/20 dark:text-sky-300",
    muted: "bg-muted text-muted-foreground border-border/60",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium tracking-tight",
        styles[tone]
      )}
    >
      {children}
    </span>
  );
};

const SummaryChip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="ev1-chip inline-flex items-center gap-1.5 px-3 py-1 text-xs">
    <span className="ev1-muted">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const ChecklistStatusIcon: React.FC<{ status: ChecklistStatus }> = ({ status }) => {
  if (status === "done") return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />;
  if (status === "in-progress") return <Clock className="h-3.5 w-3.5 text-sky-600" />;
  if (status === "waiting-client") return <AlertCircle className="h-3.5 w-3.5 text-amber-600" />;
  return <Circle className="h-3.5 w-3.5 text-muted-foreground/50" />;
};

const stageLabel = (s: EntityStage) => STAGES.find((x) => x.key === s)?.label ?? s;

// ────────────────────────────────────────────────────────────────
// Selector popover
// ────────────────────────────────────────────────────────────────

const Selector: React.FC<{
  value: string;
  options: string[];
  onChange: (v: string) => void;
  icon?: React.ElementType;
}> = ({ value, options, onChange, icon: Icon }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/70 px-3 py-1.5 text-sm hover:bg-muted/50 transition">
          {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
          <span className="font-medium">{value}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-0">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No match.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o}
                  onSelect={() => {
                    onChange(o);
                    setOpen(false);
                  }}
                >
                  {o}
                  {o === value && <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-primary" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

// ────────────────────────────────────────────────────────────────
// Main page
// ────────────────────────────────────────────────────────────────

const Ev1_EntityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState("All companies");
  const [country, setCountry] = useState("All countries");
  const [view, setView] = useState<"board" | "list">("board");
  const [active, setActive] = useState<EntityRecord | null>(null);

  const filtered = useMemo(
    () =>
      ENTITIES.filter(
        (e) =>
          (company === "All companies" || e.company === company) &&
          (country === "All countries" || e.country === country)
      ),
    [company, country]
  );

  return (
    <div
      className="ev1-brand min-h-screen flex flex-col"
      style={{
        background: BRAND.cream,
        fontFamily:
          "'Outfit', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        color: BRAND.ink,
      }}
    >
      {/* Brand-scoped styles */}
      <style>{`
        .ev1-brand { letter-spacing: -0.01em; }
        .ev1-brand h1, .ev1-brand h2, .ev1-brand h3 { font-family: 'Outfit', sans-serif; letter-spacing: -0.035em; font-weight: 600; }
        .ev1-brand .ev1-pill { background: ${BRAND.ink}; color: ${BRAND.cream}; border-radius: 999px; transition: transform .15s ease, opacity .15s ease; }
        .ev1-brand .ev1-pill:hover { transform: translateY(-1px); opacity: .92; }
        .ev1-brand .ev1-pill-outline { background: transparent; color: ${BRAND.ink}; border: 1px solid ${BRAND.ink}; border-radius: 999px; }
        .ev1-brand .ev1-pill-outline:hover { background: ${BRAND.ink}; color: ${BRAND.cream}; }
        .ev1-brand .ev1-card { background: #fdfcf8; border: 1px solid ${BRAND.ink}; border-radius: 22px; box-shadow: 4px 4px 0 ${BRAND.ink}; }
        .ev1-brand .ev1-card-soft { background: #fdfcf8; border: 1.5px dashed ${BRAND.ink}; border-radius: 22px; }
        .ev1-brand .ev1-tint-pink { background: ${BRAND.pink}; }
        .ev1-brand .ev1-tint-mint { background: ${BRAND.mint}; }
        .ev1-brand .ev1-tint-sand { background: ${BRAND.sand}; }
        .ev1-brand .ev1-tint-lavender { background: ${BRAND.lavender}; }
        .ev1-brand .ev1-tint-cream { background: #fdfcf8; }
        .ev1-brand .ev1-chip { background: #fdfcf8; border: 1px solid ${BRAND.ink}; border-radius: 999px; color: ${BRAND.ink}; }
        .ev1-brand .ev1-muted { color: hsl(0 0% 35%); }
      `}</style>

      {/* Header */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: BRAND.cream + "e6",
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${BRAND.ink}1a`,
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate("/?tab=flows")}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img src={frontedLogo} alt="Fronted" className="h-5 w-auto" />
          </button>
          <div className="flex items-center gap-2">
            <Selector value={company} onChange={setCompany} options={COMPANIES} icon={Building2} />
            <Selector value={country} onChange={setCountry} options={COUNTRIES} icon={Globe2} />
            <button className="ev1-pill-outline h-9 px-4 text-xs font-medium inline-flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5" />
              Request client details
            </button>
            <button className="ev1-pill h-9 px-4 text-xs font-medium inline-flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add entity
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-6 lg:px-10 py-12 space-y-16">
        {/* Title block */}
        <section className="space-y-6">
          <div className="space-y-2 max-w-3xl">
            <h1 className="text-5xl lg:text-6xl leading-[0.95] font-semibold">
              Set up, run, and<br/>track local entities.
            </h1>
            <p className="text-base ev1-muted max-w-xl pt-2">
              One operating layer for company-level setup, payroll, compliance and admin — across countries.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SummaryChip label="Entities" value="3" />
            <SummaryChip label="In setup" value="2 countries" />
            <SummaryChip label="Workers" value="18" />
            <SummaryChip label="Next payroll" value="25 Jan" />
          </div>
        </section>

        {/* Group financials — birds-eye, YTD across all entities */}
        <GroupFinancialsSection />

        {/* Overview cards — visual KPI row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <EntityStatusCard active={1} setup={2} waiting={1} />
          <PayrollReadinessCard ready={12} missing={3} target="25 Jan" />
          <SavingsCard
            eor={63400}
            direct={41200}
            trend={[
              { m: "Aug", eor: 62, direct: 62 },
              { m: "Sep", eor: 62.4, direct: 58 },
              { m: "Oct", eor: 62.8, direct: 52 },
              { m: "Nov", eor: 63, direct: 47 },
              { m: "Dec", eor: 63.2, direct: 44 },
              { m: "Jan", eor: 63.4, direct: 41.2 },
            ]}
          />
          <OpenActionsCard missing={7} docs={4} compliance={1} />
        </section>

        {/* Entity setup pipeline */}
        <section className="space-y-5">
          <div className="flex items-end justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl lg:text-4xl">Entity setup pipeline</h2>
              <p className="text-sm ev1-muted mt-2 max-w-xl">
                Company and country-level progress, from intake to active entity.
              </p>
            </div>
            <ViewToggle value={view} onChange={setView} />
          </div>

          <PipelineFlowBar entities={filtered} onOpen={setActive} />

          {view === "board" ? (
            <BoardView entities={filtered} onOpen={setActive} />
          ) : (
            <ListView entities={filtered} onOpen={setActive} />
          )}
        </section>

        {/* Open actions across the group */}
        <OpenActionsAcrossGroup />

      </main>


      {/* Detail drawer */}
      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[640px] p-0 overflow-y-auto">
          {active && <EntityDrawer entity={active} onClose={() => setActive(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// Sub components
// ────────────────────────────────────────────────────────────────

// ────────────────────────────────────────────────────────────────
// Group financials — birds-eye YTD view across all entities
// ────────────────────────────────────────────────────────────────

const FIN_MONTHS = [
  { m: "Jan", revenue: 118, costs: 92, net: 26 },
  { m: "Feb", revenue: 124, costs: 95, net: 29 },
  { m: "Mar", revenue: 132, costs: 101, net: 31 },
  { m: "Apr", revenue: 138, costs: 104, net: 34 },
  { m: "May", revenue: 145, costs: 108, net: 37 },
  { m: "Jun", revenue: 0, costs: 0, net: 0 },
  { m: "Jul", revenue: 0, costs: 0, net: 0 },
  { m: "Aug", revenue: 0, costs: 0, net: 0 },
  { m: "Sep", revenue: 0, costs: 0, net: 0 },
  { m: "Oct", revenue: 0, costs: 0, net: 0 },
  { m: "Nov", revenue: 0, costs: 0, net: 0 },
  { m: "Dec", revenue: 0, costs: 0, net: 0 },
];

const COST_SPLIT = [
  { name: "Salaries & employer tax", value: 65, color: BRAND.ink },
  { name: "Pension & insurance", value: 9, color: BRAND.mintDeep },
  { name: "Office & operations", value: 11, color: BRAND.pinkDeep },
  { name: "Software & services", value: 8, color: BRAND.lavender },
  { name: "Other", value: 7, color: BRAND.sand },
];

const GroupFinancialsSection: React.FC = () => {
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl">Group overview</h2>
          <p className="text-sm ev1-muted mt-2 max-w-xl">
            Year-to-date across all entities — revenue, costs, and net result.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SummaryChip label="Period" value="YTD · 2026" />
          <SummaryChip label="Source" value="Synced" />
        </div>
      </div>

      {/* Headline YTD numbers — three big stats inside one ticket */}
      <div className="ev1-card ev1-tint-cream p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: BRAND.ink + "26" }}>
          <FinStat label="Revenue YTD" value="€745k" sub="5 months · €149k/mo avg" tone="ink" />
          <FinStat label="Costs YTD" value="€580k" sub="€116k/mo · employer all-in" tone="ink" />
          <FinStat label="Net result YTD" value="€165k" sub="+€17k vs. budget" tone="mint" />
        </div>
      </div>

      {/* Chart + cost composition */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="ev1-card ev1-tint-cream p-5 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold">Result 2026</p>
              <p className="text-xs ev1-muted mt-1">Revenue, costs and net result · synced monthly</p>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: BRAND.mintDeep }} />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ background: BRAND.pinkDeep }} />Costs</span>
              <span className="flex items-center gap-1.5"><span className="h-[2px] w-3" style={{ background: BRAND.ink }} />Net</span>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={FIN_MONTHS} margin={{ top: 6, right: 8, left: -10, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke={BRAND.ink + "12"} vertical={false} />
                <XAxis dataKey="m" tick={{ fontSize: 11, fill: BRAND.ink, opacity: 0.6 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: BRAND.ink, opacity: 0.6 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip
                  cursor={{ fill: BRAND.ink + "08" }}
                  contentStyle={{
                    background: "#fdfcf8",
                    border: `1px solid ${BRAND.ink}`,
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                  formatter={(v: number) => [`€${v}k`, ""]}
                />
                <Bar dataKey="revenue" fill={BRAND.mintDeep} radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Bar dataKey="costs" fill={BRAND.pinkDeep} radius={[3, 3, 0, 0]} maxBarSize={14} />
                <Line type="monotone" dataKey="net" stroke={BRAND.ink} strokeWidth={2} dot={{ r: 2.5, fill: BRAND.ink }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Where costs go */}
        <div className="ev1-card ev1-tint-cream p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] font-semibold">Where costs go</p>
          <p className="text-xs ev1-muted mt-1">YTD · €580k</p>
          <div className="space-y-2.5 mt-5">
            {COST_SPLIT.map((c) => (
              <div key={c.name} className="space-y-1">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                    {c.name}
                  </span>
                  <span className="tabular-nums font-medium">{c.value}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: BRAND.ink + "0f" }}>
                  <div className="h-full rounded-full" style={{ width: `${c.value}%`, background: c.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FinStat: React.FC<{ label: string; value: string; sub: string; tone?: "ink" | "mint" }> = ({ label, value, sub, tone = "ink" }) => (
  <div className="p-6 md:p-7">
    <p className="text-[11px] uppercase tracking-[0.18em] font-semibold ev1-muted">{label}</p>
    <div
      className="text-4xl lg:text-5xl font-semibold tabular-nums mt-2"
      style={{
        fontFamily: "'Outfit', sans-serif",
        letterSpacing: "-0.04em",
        color: tone === "mint" ? BRAND.mintDeep : BRAND.ink,
      }}
    >
      {value}
    </div>
    <p className="text-xs ev1-muted mt-2">{sub}</p>
  </div>
);

// ────────────────────────────────────────────────────────────────
// Open actions across the group
// ────────────────────────────────────────────────────────────────

type GroupActionTone = "payroll" | "filings" | "compliance" | "reporting";

interface GroupAction {
  tag: string;
  tone: GroupActionTone;
  title: string;
  entity: string;
  flag: string;
  meta: string;
  due: string;
  status: { label: string; tone: "warn" | "info" | "ok" | "muted" };
}

const GROUP_ACTIONS: GroupAction[] = [
  {
    tag: "Payroll",
    tone: "payroll",
    title: "January payroll — approve batch",
    entity: "Initech Ltd · 8 workers",
    flag: "🇵🇭",
    meta: "USD 108k",
    due: "Due 22 Jan · in 3 days",
    status: { label: "Approval needed", tone: "warn" },
  },
  {
    tag: "Compliance",
    tone: "compliance",
    title: "Yrkesskade insurance renewal",
    entity: "Waystar Royco · mandatory",
    flag: "🇸🇪",
    meta: "Renews annually",
    due: "Due 31 Jan",
    status: { label: "Action needed", tone: "warn" },
  },
  {
    tag: "Filings",
    tone: "filings",
    title: "MVA Q4 return — review",
    entity: "Acme Corp · Oct–Dec VAT",
    flag: "🇸🇬",
    meta: "NOK 142k",
    due: "Due 10 Feb",
    status: { label: "Ready to review", tone: "info" },
  },
  {
    tag: "Filings",
    tone: "filings",
    title: "A-skat payroll tax",
    entity: "Massive Dynamic · approve before submission",
    flag: "🇩🇰",
    meta: "DKK 86k",
    due: "Due 10 Feb",
    status: { label: "Approval needed", tone: "warn" },
  },
  {
    tag: "Filings",
    tone: "filings",
    title: "Lohnsteuer-Anmeldung",
    entity: "Globex Inc · monthly",
    flag: "🇩🇪",
    meta: "EUR 24k",
    due: "Due 10 Feb",
    status: { label: "Approval needed", tone: "warn" },
  },
  {
    tag: "Reporting",
    tone: "reporting",
    title: "2025 annual accounts",
    entity: "Oscorp · Årsredovisning to Bolagsverket",
    flag: "🇸🇪",
    meta: "Audited",
    due: "Due 31 Jul",
    status: { label: "Drafting", tone: "muted" },
  },
];

const tagBg = (t: GroupActionTone) =>
  ({ payroll: BRAND.sand, filings: BRAND.mint, compliance: BRAND.pink, reporting: BRAND.lavender }[t]);

const OpenActionsAcrossGroup: React.FC = () => {
  const critical = GROUP_ACTIONS.filter((a) => a.status.tone === "warn").length;
  const thisWeek = 5;
  return (
    <section className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl lg:text-4xl">Open actions across the group</h2>
          <p className="text-sm ev1-muted mt-2 max-w-xl">
            {critical} critical · {thisWeek} this week · 5 scheduled later — across all entities.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SummaryChip label="Period" value="Jan 2026" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {GROUP_ACTIONS.map((a) => (
          <div
            key={a.title}
            className="ev1-card p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5 cursor-pointer"
            style={{ background: "#fdfcf8" }}
          >
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] uppercase tracking-[0.18em] font-semibold px-2 py-0.5 rounded-full border"
                style={{ background: tagBg(a.tone), borderColor: BRAND.ink, color: BRAND.ink }}
              >
                {a.tag}
              </span>
              <span className="text-base leading-none">{a.flag}</span>
            </div>
            <div>
              <h3 className="text-lg leading-tight font-semibold">{a.title}</h3>
              <p className="text-xs ev1-muted mt-1">{a.entity} · {a.meta}</p>
            </div>
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: BRAND.ink + "1f" }}>
              <span className="text-[11px] ev1-muted">{a.due}</span>
              <StatusChip tone={a.status.tone}>{a.status.label}</StatusChip>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ────────────────────────────────────────────────────────────────
// Visual overview cards
// ────────────────────────────────────────────────────────────────

const KPICard: React.FC<{
  title: string;
  big: React.ReactNode;
  delta?: { tone: "ok" | "warn"; label: string };
  tint?: "cream" | "pink" | "mint" | "sand" | "lavender";
  children?: React.ReactNode;
}> = ({ title, big, delta, tint = "cream", children }) => (
  <div
    className={cn(
      "ev1-card p-5 flex flex-col gap-3 transition-transform hover:-translate-y-0.5",
      `ev1-tint-${tint}`
    )}
  >
    <div className="flex items-center justify-between">
      <p className="text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: BRAND.ink }}>{title}</p>
      {delta && (
        <span
          className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold tabular-nums ev1-chip px-2 py-0.5"
        >
          {delta.tone === "ok" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {delta.label}
        </span>
      )}
    </div>
    <div className="text-3xl font-semibold tracking-tight tabular-nums leading-none" style={{ color: BRAND.ink, fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.04em" }}>
      {big}
    </div>
    {children}
  </div>
);

const EntityStatusCard: React.FC<{ active: number; setup: number; waiting: number }> = ({
  active,
  setup,
  waiting,
}) => {
  const data = [
    { name: "Active", value: active, color: CHART.ok },
    { name: "In setup", value: setup, color: CHART.primary },
    { name: "Waiting", value: waiting, color: CHART.warn },
  ];
  const total = active + setup + waiting;
  return (
    <KPICard title="Entity status" big={`${total}`} delta={{ tone: "ok", label: "+1 this qtr" }} tint="mint">
      <div className="flex items-center gap-3 -mt-1">
        <div className="relative h-[68px] w-[68px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={22}
                outerRadius={32}
                strokeWidth={0}
                paddingAngle={2}
              >
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tabular-nums">
            {total}
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {data.map((d) => (
            <div key={d.name} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                {d.name}
              </span>
              <span className="font-medium text-foreground tabular-nums">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </KPICard>
  );
};

const PayrollReadinessCard: React.FC<{ ready: number; missing: number; target: string }> = ({
  ready,
  missing,
  target,
}) => {
  const pct = Math.round((ready / (ready + missing)) * 100);
  const series = [4, 6, 7, 9, 10, 11, 12].map((v, i) => ({ d: i, v }));
  return (
    <KPICard title="Payroll readiness" big={`${pct}%`} delta={{ tone: "ok", label: "+8% MoM" }} tint="cream">
      <div className="h-[42px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="pr-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.35} />
                <stop offset="100%" stopColor={CHART.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={CHART.primary}
              strokeWidth={1.75}
              fill="url(#pr-grad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
        <span>
          <span className="text-foreground font-medium">{ready}</span> ready · {missing} missing
        </span>
        <span>Target {target}</span>
      </div>
    </KPICard>
  );
};

const SavingsCard: React.FC<{
  eor: number;
  direct: number;
  trend: { m: string; eor: number; direct: number }[];
}> = ({ eor, direct, trend }) => {
  const saving = eor - direct;
  const pct = Math.round((saving / eor) * 100);
  return (
    <KPICard
      title="Estimated savings"
      tint="lavender"
      big={
        <span>
          ${(saving / 1000).toFixed(1)}k
          <span className="text-xs font-normal ml-1 ev1-muted">/mo</span>
        </span>
      }
      delta={{ tone: "ok", label: `−${pct}% vs EOR` }}
    >
      <div className="h-[44px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trend} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
            <Line
              type="monotone"
              dataKey="eor"
              stroke={CHART.muted}
              strokeWidth={1.5}
              strokeDasharray="3 3"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="direct"
              stroke={CHART.ok}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40 pt-2">
        <span className="flex items-center gap-1">
          <span className="h-px w-3 border-t border-dashed border-muted-foreground/60" />
          EOR ${(eor / 1000).toFixed(0)}k
        </span>
        <span className="flex items-center gap-1">
          <span className="h-[2px] w-3 bg-emerald-600" />
          Direct ${(direct / 1000).toFixed(0)}k
        </span>
      </div>
    </KPICard>
  );
};

const OpenActionsCard: React.FC<{ missing: number; docs: number; compliance: number }> = ({
  missing,
  docs,
  compliance,
}) => {
  const data = [
    { name: "Missing", v: missing, color: CHART.warn },
    { name: "Docs", v: docs, color: CHART.info },
    { name: "Compliance", v: compliance, color: CHART.primary },
  ];
  const total = missing + docs + compliance;
  return (
    <KPICard title="Open actions" big={`${total}`} delta={{ tone: "warn", label: "−3 this week" }} tint="cream">
      <div className="h-[52px] -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap={10}>
            <Bar dataKey="v" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Bar>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
              interval={0}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </KPICard>
  );
};

// ────────────────────────────────────────────────────────────────
// Pipeline visual flow bar
// ────────────────────────────────────────────────────────────────

const PipelineFlowBar: React.FC<{
  entities: EntityRecord[];
  onOpen: (e: EntityRecord) => void;
}> = ({ entities, onOpen }) => {
  const stageColors: Record<EntityStage, string> = {
    intake: BRAND.sand,
    details: BRAND.pinkDeep,
    setup: BRAND.pink,
    payroll: BRAND.mint,
    compliance: BRAND.mintDeep,
    active: BRAND.ink,
  };
  const totals = STAGES.map((s) => ({
    ...s,
    items: entities.filter((e) => e.stage === s.key),
  }));
  const max = Math.max(1, ...totals.map((t) => t.items.length));

  return (
    <div className="ev1-card ev1-tint-cream p-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {totals.map((s, i) => {
          const heightPct = (s.items.length / max) * 100;
          const color = stageColors[s.key];
          return (
            <div key={s.key} className="relative flex flex-col">
              <div className="flex items-end h-[68px] mb-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(heightPct, 6)}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
                  className="w-full rounded-md"
                  style={{
                    background: `linear-gradient(180deg, ${color}, ${color}99)`,
                  }}
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-semibold tabular-nums text-foreground">
                    {s.items.length}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    {i + 1}/{STAGES.length}
                  </span>
                </div>
                <p className="text-[11px] font-medium text-foreground leading-tight">{s.label}</p>
                <div className="flex flex-wrap gap-0.5 pt-1">
                  {s.items.slice(0, 3).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onOpen(e)}
                      className="text-[11px] leading-none hover:scale-110 transition"
                      title={`${e.company} · ${e.country}`}
                    >
                      {e.flag}
                    </button>
                  ))}
                  {s.items.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">+{s.items.length - 3}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



const ServiceCard: React.FC<{ service: ServiceArea; onOpen: () => void }> = ({
  service,
  onOpen,
}) => {
  const Icon = service.icon;
  return (
    <Card className="group relative p-5 border-border/60 bg-background/60 hover:bg-background hover:shadow-md hover:border-border transition-all overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition" />
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-primary/[0.07] border border-primary/15 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <StatusChip tone={service.statusTone}>{service.statusLabel}</StatusChip>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-foreground mb-1">
        {service.title}
      </h3>
      <p className="text-xs text-muted-foreground leading-relaxed mb-4">{service.description}</p>
      <div className="flex items-center gap-4 mb-4">
        {service.metrics.map((m) => (
          <div key={m.label}>
            <p className="text-lg font-semibold tabular-nums text-foreground">{m.value}</p>
            <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 -ml-2 text-xs gap-1 text-primary hover:text-primary"
        onClick={onOpen}
      >
        Open
        <ArrowRight className="h-3 w-3" />
      </Button>
    </Card>
  );
};

const ViewToggle: React.FC<{ value: "board" | "list"; onChange: (v: "board" | "list") => void }> = ({
  value,
  onChange,
}) => (
  <div className="inline-flex items-center gap-0.5 rounded-lg border border-border/60 bg-background/60 p-0.5">
    {[
      { k: "board" as const, Icon: LayoutGrid, label: "Board" },
      { k: "list" as const, Icon: ListIcon, label: "List" },
    ].map(({ k, Icon, label }) => (
      <button
        key={k}
        onClick={() => onChange(k)}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
          value === k
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {label}
      </button>
    ))}
  </div>
);

const BoardView: React.FC<{ entities: EntityRecord[]; onOpen: (e: EntityRecord) => void }> = ({
  entities,
  onOpen,
}) => (
  <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
    {STAGES.map((s) => {
      const items = entities.filter((e) => e.stage === s.key);
      return (
        <div
          key={s.key}
          className="min-w-[280px] flex-1 rounded-xl border border-border/60 bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <div>
              <p className="text-xs font-semibold tracking-tight text-foreground">{s.label}</p>
              <p className="text-[10.5px] text-muted-foreground leading-tight mt-0.5 line-clamp-2">
                {s.description}
              </p>
            </div>
            <span className="text-[10.5px] font-medium text-muted-foreground bg-background/70 rounded-full px-1.5 py-0.5 border border-border/50">
              {items.length}
            </span>
          </div>
          <div className="space-y-2">
            {items.length === 0 && (
              <div className="rounded-lg border border-dashed border-border/50 px-3 py-6 text-center">
                <p className="text-[11px] text-muted-foreground/70">No entities</p>
              </div>
            )}
            {items.map((e) => (
              <BoardCard key={e.id} entity={e} onOpen={() => onOpen(e)} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const BoardCard: React.FC<{ entity: EntityRecord; onOpen: () => void }> = ({ entity, onOpen }) => (
  <motion.button
    whileHover={{ y: -1 }}
    onClick={onOpen}
    className="w-full text-left rounded-lg border border-border/60 bg-background p-3 hover:shadow-sm hover:border-border transition"
  >
    <div className="flex items-center justify-between mb-1.5">
      <p className="text-[13px] font-semibold text-foreground truncate">{entity.company}</p>
      <span className="text-base leading-none">{entity.flag}</span>
    </div>
    <p className="text-[11px] text-muted-foreground mb-2">{entity.country}</p>
    <div className="flex items-center justify-between text-[10.5px] text-muted-foreground mb-2">
      <span>{entity.workers} workers</span>
      <span>EOR: {entity.currentEor ? "Yes" : "No"}</span>
    </div>
    {entity.missingItems.length > 0 && (
      <div className="flex items-center gap-1 text-[10.5px] text-amber-700 dark:text-amber-400">
        <AlertCircle className="h-2.5 w-2.5" />
        {entity.missingItems.length} missing
      </div>
    )}
    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
      <span className="text-[10.5px] text-muted-foreground truncate">{entity.nextAction}</span>
      <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 ml-1" />
    </div>
  </motion.button>
);

const ListView: React.FC<{ entities: EntityRecord[]; onOpen: (e: EntityRecord) => void }> = ({
  entities,
  onOpen,
}) => (
  <div className="rounded-xl border border-border/60 bg-background overflow-hidden">
    <div className="grid grid-cols-[1.4fr_1fr_1.2fr_0.9fr_0.7fr_0.9fr_1fr_1.4fr_0.9fr_60px] gap-3 px-4 py-2.5 text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-border/60 bg-muted/30">
      <div>Company</div>
      <div>Country</div>
      <div>Stage</div>
      <div>Status</div>
      <div className="text-right">Workers</div>
      <div className="text-right">Missing</div>
      <div>Owner</div>
      <div>Next action</div>
      <div>Updated</div>
      <div></div>
    </div>
    {entities.map((e) => (
      <button
        key={e.id}
        onClick={() => onOpen(e)}
        className="w-full grid grid-cols-[1.4fr_1fr_1.2fr_0.9fr_0.7fr_0.9fr_1fr_1.4fr_0.9fr_60px] gap-3 px-4 py-3 text-sm text-left hover:bg-muted/40 transition border-b border-border/40 last:border-b-0 items-center"
      >
        <div className="font-medium text-foreground truncate">{e.company}</div>
        <div className="text-muted-foreground truncate">
          <span className="mr-1">{e.flag}</span>
          {e.country}
        </div>
        <div className="text-xs">
          <StatusChip tone="info">{stageLabel(e.stage)}</StatusChip>
        </div>
        <div className="text-xs text-muted-foreground">{e.entityStatus}</div>
        <div className="text-right tabular-nums text-muted-foreground">{e.workers}</div>
        <div className="text-right tabular-nums text-muted-foreground">{e.missingItems.length}</div>
        <div className="text-muted-foreground truncate">{e.owner}</div>
        <div className="text-muted-foreground truncate">{e.nextAction}</div>
        <div className="text-xs text-muted-foreground truncate">{e.lastUpdated}</div>
        <div className="text-right">
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
        </div>
      </button>
    ))}
  </div>
);

// ────────────────────────────────────────────────────────────────
// Drawer
// ────────────────────────────────────────────────────────────────

const EntityDrawer: React.FC<{ entity: EntityRecord; onClose: () => void }> = ({
  entity,
  onClose,
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-xl border-b border-border/60 px-6 py-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{entity.flag}</span>
              <h2 className="text-lg font-semibold tracking-tight truncate">
                {entity.company} · {entity.country}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusChip tone="info">{stageLabel(entity.stage)}</StatusChip>
              <span>·</span>
              <span>Owner: {entity.owner}</span>
              <span>·</span>
              <span>Updated {entity.lastUpdated}</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="h-8 gap-1.5">
            <Send className="h-3.5 w-3.5" /> Request details
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            Update status
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 px-6 py-6 space-y-8">
        <DrawerSection title="Entity overview">
          <DetailGrid
            rows={[
              ["Company", entity.company],
              ["Country", `${entity.flag} ${entity.country}`],
              ["Entity type", entity.entityType],
              ["Expected workers", String(entity.employeesPlanned)],
              ["Current EOR", entity.currentEor ? "Yes" : "No"],
              ["Target go-live", entity.goLive],
              ["Current stage", stageLabel(entity.stage)],
              ["Fronted owner", entity.owner],
              ["Client contact", `${entity.clientContact.name} · ${entity.clientContact.email}`],
            ]}
          />
        </DrawerSection>

        <DrawerSection title="Client intake details">
          <DetailGrid
            rows={[
              ["Target country", entity.country],
              ["Number of employees", String(entity.employeesPlanned)],
              ["Average salary", entity.intake.avgSalary],
              ["Current EOR monthly cost", entity.intake.currentEorCost],
              ["Hiring timeline", entity.intake.hiringTimeline],
              ["Already hiring", entity.intake.alreadyHiring ? "Yes" : "No"],
              ["Currently using EOR", entity.currentEor ? "Yes" : "No"],
              ["Contact name", entity.clientContact.name],
              ["Contact email", entity.clientContact.email],
            ]}
          />
          <div className="mt-3 rounded-lg bg-muted/40 border border-border/40 px-3 py-2.5">
            <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground/90 leading-relaxed">{entity.intake.notes}</p>
          </div>
        </DrawerSection>

        <DrawerSection title="Setup checklist">
          <div className="space-y-4">
            {entity.checklist.map((g) => (
              <div key={g.title}>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
                  {g.title}
                </p>
                <ul className="space-y-1.5">
                  {g.items.map((it) => (
                    <li
                      key={it.label}
                      className="flex items-center justify-between text-sm py-1.5 px-2 rounded-md hover:bg-muted/40 transition"
                    >
                      <span className="flex items-center gap-2">
                        <ChecklistStatusIcon status={it.status} />
                        <span className="text-foreground/90">{it.label}</span>
                      </span>
                      <span className="text-[10.5px] text-muted-foreground capitalize">
                        {it.status.replace("-", " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DrawerSection>

        <DrawerSection title="Missing items">
          {entity.missingItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outstanding items.</p>
          ) : (
            <ul className="space-y-1.5">
              {entity.missingItems.map((m) => (
                <li
                  key={m}
                  className="flex items-center gap-2 text-sm rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-3 py-2"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-foreground/90">{m}</span>
                </li>
              ))}
            </ul>
          )}
        </DrawerSection>

        <DrawerSection title="Documents">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {entity.documents.map((d) => (
              <div
                key={d}
                className="flex items-center gap-2 text-sm rounded-md border border-border/50 bg-background px-3 py-2 hover:bg-muted/40 transition"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{d}</span>
              </div>
            ))}
          </div>
        </DrawerSection>

        <DrawerSection title="Activity timeline">
          <ol className="space-y-3 relative pl-5 before:absolute before:left-1.5 before:top-1 before:bottom-1 before:w-px before:bg-border">
            {entity.timeline.map((t) => (
              <li key={t.label} className="relative">
                <span
                  className={cn(
                    "absolute -left-[18px] top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
                    t.done ? "bg-emerald-500" : "bg-muted-foreground/40"
                  )}
                />
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "text-sm",
                      t.done ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {t.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{t.date}</span>
                </div>
              </li>
            ))}
          </ol>
        </DrawerSection>
      </div>
    </div>
  );
};

const DrawerSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section>
    <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-3 font-medium">
      {title}
    </h3>
    {children}
  </section>
);

const DetailGrid: React.FC<{ rows: [string, string][] }> = ({ rows }) => (
  <div className="rounded-lg border border-border/50 bg-background divide-y divide-border/40">
    {rows.map(([k, v]) => (
      <div key={k} className="grid grid-cols-[160px_1fr] gap-4 px-3 py-2 text-sm">
        <div className="text-muted-foreground">{k}</div>
        <div className="text-foreground/90">{v}</div>
      </div>
    ))}
  </div>
);

export default Ev1_EntityDashboard;
