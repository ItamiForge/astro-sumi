import {
  AlertCircle,
  AlertTriangle,
  Anchor,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Book,
  BookOpen,
  Bookmark,
  Calendar,
  Check,
  CheckCircle,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock,
  Code,
  Dumbbell,
  Edit,
  FileText,
  GitBranch,
  Globe,
  Hash,
  HelpCircle,
  Home,
  Info,
  Lightbulb,
  List,
  Mail,
  MessageCircle,
  MessageCircleQuestion,
  MessageSquareWarning,
  Moon,
  PauseCircle,
  PenTool,
  PlayCircle,
  Puzzle,
  RotateCcw,
  Rss,
  ShieldAlert,
  Sun,
  Tag,
  Tags,
  User,
  Users,
  X,
  XCircle,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const iconMap = {
  'alert-circle': AlertCircle,
  'alert-triangle': AlertTriangle,
  anchor: Anchor,
  'arrow-left': ArrowLeft,
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  book: Book,
  'book-open': BookOpen,
  bookmark: Bookmark,
  calendar: Calendar,
  check: Check,
  'check-circle': CheckCircle,
  'check-circle-2': CheckCircle2,
  'check-square': CheckSquare,
  'chevron-down': ChevronDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  'circle-help': CircleHelp,
  clock: Clock,
  code: Code,
  dumbbell: Dumbbell,
  edit: Edit,
  'file-text': FileText,
  'git-branch': GitBranch,
  github: GitBranch, // Using GitBranch as GitHub brand icon is deprecated
  globe: Globe,
  hash: Hash,
  'help-circle': HelpCircle,
  home: Home,
  info: Info,
  lightbulb: Lightbulb,
  list: List,
  mail: Mail,
  'message-circle': MessageCircle,
  'message-circle-question': MessageCircleQuestion,
  'message-square-warning': MessageSquareWarning,
  moon: Moon,
  'pause-circle': PauseCircle,
  'pen-tool': PenTool,
  'play-circle': PlayCircle,
  puzzle: Puzzle,
  'rotate-ccw': RotateCcw,
  rss: Rss,
  'shield-alert': ShieldAlert,
  sun: Sun,
  tag: Tag,
  tags: Tags,
  user: User,
  users: Users,
  x: X,
  'x-circle': XCircle,
} as const

type IconName = keyof typeof iconMap

interface IconProps extends Omit<LucideProps, 'ref'> {
  name: IconName | `lucide:${IconName}`
}

export function Icon({ name, ...props }: IconProps) {
  // Remove 'lucide:' prefix if present
  const iconName = name.startsWith('lucide:')
    ? (name.slice(7) as IconName)
    : (name as IconName)

  const IconComponent = iconMap[iconName]

  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found`)
    return null
  }

  return <IconComponent {...props} />
}
