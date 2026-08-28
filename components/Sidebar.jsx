'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { 
  LayoutDashboard, 
  ReceiptText, 
  AlertCircle, 
  GitBranch, 
  BarChart3, 
  Bot, 
  Settings, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  GripVertical
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

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const { width, isCollapsed, toggleCollapse, setWidth, setIsDragging, isDragging } = useSidebar();
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  // Drag resize handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    setIsDragging(true);

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current;
      const newWidth = startWidthRef.current + deltaX;
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <aside 
      className={`relative flex h-full flex-col select-none transition-all ${
        isDragging ? 'transition-none' : 'duration-150'
      }`}
      style={{ 
        width: `${width}px`, 
        backgroundColor: 'var(--sidebar-bg)',
      }}
    >
      {/* Brand Header */}
      <div className={`flex h-14 items-center border-b border-white/[0.06] ${isCollapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden group">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="PaySynapse Logo" className="h-7 w-7 rounded-lg" />
          </div>
          {!isCollapsed && (
            <span className="text-[14px] font-semibold tracking-tight text-white truncate">
              PaySynapse
            </span>
          )}
        </Link>

        {/* Collapse Button */}
        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            title="Collapse Sidebar (mini mode)"
            className="p-1 rounded-md text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        <nav className="space-y-0.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                title={isCollapsed ? item.name : undefined}
                className={`
                  group relative flex items-center gap-3 rounded-lg py-2 text-[13px] font-medium transition-colors duration-150
                  ${isCollapsed ? 'justify-center px-0' : 'px-3'}
                  ${isActive
                    ? 'text-white'
                    : 'text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)]'
                  }
                `}
                style={isActive ? { backgroundColor: 'var(--sidebar-active)' } : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full" style={{ backgroundColor: 'var(--sidebar-accent)' }} />
                )}

                <item.icon className={`h-4 w-4 shrink-0 ${
                  isActive 
                    ? 'text-[var(--sidebar-accent)]' 
                    : 'text-[var(--sidebar-text)] group-hover:text-gray-300'
                }`} />
                
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer: Expand toggle, System Status & Logout */}
      <div className="border-t border-white/[0.06] p-2 space-y-1.5">
        {isCollapsed ? (
          <button
            onClick={toggleCollapse}
            title="Expand Sidebar"
            className="w-full flex items-center justify-center p-2 rounded-lg text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <div className="flex items-center gap-2 px-2 py-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[11px] font-medium text-[var(--sidebar-text)] truncate">
              System Operational
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={isCollapsed ? "Sign Out" : undefined}
          className={`w-full flex items-center gap-2.5 rounded-lg py-2 text-[13px] font-medium text-[var(--sidebar-text)] hover:text-rose-400 hover:bg-rose-500/10 transition-colors duration-150 disabled:opacity-50 ${
            isCollapsed ? 'justify-center px-0' : 'px-2.5'
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>}
        </button>
      </div>

      {/* Resize Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        title="Drag horizontally to resize sidebar"
        className={`absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-[#528FF0]/50 transition-colors z-20 group ${
          isDragging ? 'bg-[#528FF0]' : 'hover:w-2'
        }`}
      >
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-3 h-8 bg-slate-700 rounded-l border border-slate-600 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
          <GripVertical className="w-2.5 h-2.5 text-slate-300" />
        </div>
      </div>
    </aside>
  );
}
