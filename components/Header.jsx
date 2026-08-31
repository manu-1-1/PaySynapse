'use client';

import { Search, Bell, User, RefreshCw, Sun, Moon, AlertTriangle, LogOut, PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Polling logic
    const fetchNotifications = async () => {
      try {
        const lastChecked = localStorage.getItem('lastCheckedNotifs');
        const url = lastChecked ? `/api/exceptions/recent?since=${lastChecked}` : `/api/exceptions/recent`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
          if (!lastChecked) {
            setUnreadCount(data.data?.length || 0);
          } else {
            setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : (data.data?.length || 0));
          }
        }
      } catch (err) {}
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);

    // Fetch user profile
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {}
    };
    fetchProfile();

    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenNotifications = () => {
    setShowProfile(false);
    setShowDropdown(!showDropdown);
    if (!showDropdown) {
      setUnreadCount(0);
      localStorage.setItem('lastCheckedNotifs', new Date().toISOString());
    }
  };

  const handleOpenProfile = () => {
    setShowDropdown(false);
    setShowProfile(!showProfile);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profile.name, email: profile.email })
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setShowProfile(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

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

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-6 sticky top-0 z-40 print:hidden">
      {/* Merchant / Context Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          className="p-1.5 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-[var(--muted)] transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4 text-[#528FF0]" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--foreground)] tracking-tight">PaySynapse Ops</span>
          <span className="text-gray-400 text-xs">/</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Production
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Sync */}
        <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 px-3 py-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors duration-150">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors duration-150"
        >
          {mounted ? (
            theme === 'dark' 
              ? <Moon className="h-4 w-4 text-gray-400" /> 
              : <Sun className="h-4 w-4 text-gray-500" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleOpenNotifications}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors duration-150"
          >
            <Bell className="h-4 w-4 text-gray-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[340px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-[var(--border)] bg-[var(--muted)] font-semibold text-sm flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-[#528FF0]" />
                  Notifications
                </span>
                <span className="text-xs text-[var(--muted-foreground)] font-normal bg-[var(--surface)] px-2 py-0.5 rounded-md">{notifications.length} recent</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    No new alerts
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Link 
                      key={notif.id} 
                      href={`/exceptions/${notif.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="block p-3 border-b border-[var(--border)] hover:bg-[var(--surface-hover)] transition-colors duration-100 last:border-0"
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 mt-0.5 mr-3 p-1.5 rounded-md ${notif.severity === 'HIGH' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                          <AlertTriangle className={`w-3.5 h-3.5 ${notif.severity === 'HIGH' ? 'text-red-500' : 'text-amber-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--foreground)]">{notif.type.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-2">{notif.description}</div>
                          <div className="text-xs font-semibold mt-1 text-[#528FF0]">
                            ₹{Number(notif.financialImpact || 0).toLocaleString('en-IN')} Variance
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="p-2.5 border-t border-[var(--border)] text-center bg-[var(--muted)]">
                <Link href="/exceptions" onClick={() => setShowDropdown(false)} className="text-xs text-[#528FF0] hover:underline font-medium">
                  View all exceptions →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={handleOpenProfile}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#528FF0] hover:bg-[#4080E0] transition-colors duration-150"
          >
            <User className="h-4 w-4 text-white" />
            <span className="sr-only">Profile</span>
          </button>

          {showProfile && profile && (
            <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)]">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-[#528FF0] flex items-center justify-center text-white font-semibold text-sm">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">{profile.name}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{profile.role}</div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="p-4 space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full text-sm px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--muted)] focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                    required
                  />
                </div>
                <div className="pt-1 space-y-2">
                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="w-full bg-[#528FF0] hover:bg-[#4080E0] text-white py-2 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 py-2 rounded-lg text-sm font-medium transition-colors duration-150 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {loggingOut ? 'Logging out...' : 'Sign Out'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
