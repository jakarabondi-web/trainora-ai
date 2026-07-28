import {
  Activity, ArrowRight, BadgeCheck, Banknote, BarChart3, BellRing, BookOpenCheck,
  BrainCircuit, BriefcaseBusiness, Building2, Cable, CircleHelp, ClipboardCheck,
  Code2, CreditCard, Database, Download, FileCheck2, FolderKanban, Globe2,
  Landmark, Languages, LayoutDashboard, LifeBuoy, ListChecks, MessageCircle,
  Network, PlugZap, ReceiptText, RefreshCw, Scale, ScrollText, Search, Settings,
  ShieldAlert, ShieldCheck, Sparkles, Stethoscope, Target, Upload, UserCheck,
  UserRound, Users, WalletCards,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

const icons = {
  activity: Activity,
  arrow: ArrowRight,
  assessment: BookOpenCheck,
  audit: ScrollText,
  bank: Landmark,
  billing: CreditCard,
  brain: BrainCircuit,
  client: Building2,
  code: Code2,
  database: Database,
  download: Download,
  feedback: MessageCircle,
  files: FileCheck2,
  fraud: ShieldAlert,
  globe: Globe2,
  help: CircleHelp,
  jobs: BriefcaseBusiness,
  language: Languages,
  notifications: BellRing,
  payments: WalletCards,
  projects: FolderKanban,
  quality: BadgeCheck,
  refresh: RefreshCw,
  reports: BarChart3,
  reviewer: ClipboardCheck,
  roles: Network,
  sales: Banknote,
  search: Search,
  security: ShieldCheck,
  settings: Settings,
  source: Cable,
  sparkles: Sparkles,
  tasks: ListChecks,
  target: Target,
  trainer: UserCheck,
  upload: Upload,
  user: UserRound,
  users: Users,
  integrations: PlugZap,
  medical: Stethoscope,
  invoices: ReceiptText,
  disputes: Scale,
  support: LifeBuoy,
} as const;

export type DashboardIconName = keyof typeof icons;

export function DashboardIcon({ name, ...props }: { name: DashboardIconName } & LucideProps) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.9} {...props}/>;
}
