import Link from "next/link"
import { LayoutDashboard, ReceiptText, AlertCircle, GitBranch, BarChart3, Bot, Settings } from "lucide-react"

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Exceptions', href: '/exceptions', icon: AlertCircle },
  { name: 'Digital Twin', href: '/digital-twin', icon: GitBranch },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Copilot', href: '/copilot', icon: Bot },
  { name: 'Integrations', href: '/integrations', icon: Settings },
]

export function Sidebar() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-6 lg:h-[60px]">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold tracking-tight">PaySynapse</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
