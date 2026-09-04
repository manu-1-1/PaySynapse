'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ReceiptText, 
  AlertCircle, 
  GitBranch, 
  BarChart3, 
  Bot, 
  Settings, 
  MoreVertical,
  Activity,
  X
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const navigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ReceiptText },
  { name: 'Exceptions', href: '/exceptions', icon: AlertCircle },
  { name: 'Digital Twin', href: '/digital-twin', icon: GitBranch },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'AI Copilot', href: '/copilot', icon: Bot },
  { name: 'Integrations', href: '/integrations', icon: Settings },
];

export function Sidebar({ isMobile = false }) {
  const pathname = usePathname();
  const { isCollapsed, closeMobileMenu } = useSidebar();

  const collapsed = isMobile ? false : isCollapsed;

  return (
    <aside 
      className={`flex h-full flex-col select-none transition-all duration-150 border-r border-[#2D2E36] bg-[#131417] text-xs ${
        isMobile ? 'w-full' : (collapsed ? 'w-14' : 'w-56')
      }`}
    >
      {/* Drawer Section Title */}
      <div className="px-4 py-3 border-b border-[#2D2E36]/60 flex items-center justify-between text-[#9AA0A6]">
        {!collapsed && (
          <span className="font-mono uppercase text-[11px] font-semibold tracking-wider text-[#9AA0A6]">
            Operations
          </span>
        )}
        {isMobile && (
          <button 
            onClick={closeMobileMenu}
            className="p-1 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#1C1D22] transition-colors"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-0.5 px-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (isMobile) closeMobileMenu();
                }}
                title={collapsed ? item.name : undefined}
                className={`
                  group relative flex items-center justify-between rounded py-2.5 text-xs transition-colors
                  ${collapsed ? 'justify-center px-0' : 'px-3'}
                  ${isActive
                    ? 'bg-[#1E2838] text-[#8AB4F8] font-medium'
                    : 'text-[#E8EAED] hover:bg-[#1C1D22] hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[#8AB4F8]' : 'text-[#9AA0A6] group-hover:text-[#E8EAED]'}`} />
                  {!collapsed && <span className="truncate">{item.name}</span>}
                </div>

                {!collapsed && isActive && (
                  <MoreVertical className="w-3.5 h-3.5 text-[#9AA0A6] opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#2D2E36] bg-[#131417] text-[11px] text-[#9AA0A6]">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[#E8EAED]">Engine Operational</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
        )}
      </div>
    </aside>
  );
}
