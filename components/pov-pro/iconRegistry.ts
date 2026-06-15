import {
  Camera,
  Upload,
  Scissors,
  Send,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Target,
  RefreshCw,
  Flame,
  Sparkles,
  Box,
  BarChart3,
  ShieldCheck,
  ListChecks,
  Video,
  KeyRound,
  Clapperboard,
  Wallet,
  EyeOff,
  LineChart,
  ScanEye,
  PiggyBank,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react'

// Maps the string icon names used in the avatar/universal data to lucide
// components. Keeping data string-based keeps it serializable and portable.
const ICONS: Record<string, LucideIcon> = {
  Camera,
  Upload,
  Scissors,
  Send,
  MessageCircle,
  TrendingUp,
  DollarSign,
  Target,
  RefreshCw,
  Flame,
  Sparkles,
  Box,
  BarChart3,
  ShieldCheck,
  ListChecks,
  Video,
  KeyRound,
  Clapperboard,
  Wallet,
  EyeOff,
  LineChart,
  ScanEye,
  PiggyBank,
  CheckCircle2,
}

/** Returns the lucide icon for a name, falling back to a check circle. */
export function getIcon(name?: string): LucideIcon {
  if (name && ICONS[name]) return ICONS[name]
  return CheckCircle2
}
