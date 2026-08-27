'use client';

import { Search, Bell, User, RefreshCw, Sun, Moon, AlertTriangle, LogOut } from "lucide-react"
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
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
        const lastChecked = localStorage.getItem('lastCheckedNotifs') || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const res = await fetch(`/api/exceptions/recent?since=${lastChecked}`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
          setUnreadCount(data.data?.length || 0);
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
    <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl px-6 sticky top-0 z-40">
      {/* Search */}
      <div className="w-full flex-1">
        <form>
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            <input
              type="search"
              placeholder="Search transactions, exceptions..."
              className="w-full appearance-none bg-slate-100/70 dark:bg-slate-800/50 pl-10 pr-4 shadow-none md:w-2/3 lg:w-[340px] rounded-xl border border-transparent h-10 text-sm outline-none transition-all duration-300 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-200 dark:focus:border-blue-800 focus:shadow-[0_0_0_3px_rgba(45,136,255,0.1)] placeholder:text-slate-400"
            />
          </div>
        </form>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5">
        {/* Sync */}
        <button className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-3 py-2 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-all duration-200">
          <RefreshCw className="h-4 w-4 group-hover:animate-spin" />
          <span className="hidden sm:inline">Sync</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200 hover:shadow-sm"
        >
          {mounted ? (
            theme === 'dark' 
              ? <Moon className="h-4 w-4 text-indigo-400 transition-transform duration-300 hover:rotate-12" /> 
              : <Sun className="h-4 w-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Theme</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleOpenNotifications}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100/80 dark:bg-slate-800/50 hover:bg-slate-200/80 dark:hover:bg-slate-700/50 transition-all duration-200 hover:shadow-sm"
          >
            <Bell className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-[10px] font-bold text-white shadow-lg shadow-rose-500/30 ring-2 ring-white dark:ring-slate-950 badge-pulse px-1">
                {unreadCount}
              </span>
            )}
            <span className="sr-only">Notifications</span>
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
              <div className="p-4 border-b border-border/50 bg-slate-50/80 dark:bg-slate-900/50 font-semibold text-sm flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  Notifications
                </span>
                <span className="text-xs text-muted-foreground font-normal bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-full">{notifications.length} recent</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No new alerts
                  </div>
                ) : (
                  notifications.map((notif, idx) => (
                    <Link 
                      key={notif.id} 
                      href={`/exceptions/${notif.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="block p-4 border-b border-border/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors duration-150 last:border-0"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start">
                        <div className={`flex-shrink-0 mt-0.5 mr-3 p-1.5 rounded-lg ${notif.severity === 'HIGH' ? 'bg-rose-100 dark:bg-rose-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                          <AlertTriangle className={`w-3.5 h-3.5 ${notif.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{notif.type.replace(/_/g, ' ')}</div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.description}</div>
                          <div className="text-xs font-semibold mt-1.5 text-blue-600 dark:text-blue-400">{notif.financialImpact} INR Impact</div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="p-3 border-t border-border/50 text-center bg-slate-50/50 dark:bg-slate-900/30">
                <Link href="/exceptions" onClick={() => setShowDropdown(false)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
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
            className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20"
          >
            <User className="h-4 w-4 text-white" />
            <span className="sr-only">Profile</span>
          </button>

          {showProfile && profile && (
            <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-xl shadow-black/10 dark:shadow-black/40 z-50 overflow-hidden animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
              <div className="p-5 border-b border-border/50 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-100">{profile.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{profile.role}</div>
                  </div>
                </div>
              </div>
              <form onSubmit={handleProfileUpdate} className="p-4 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Name</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={(e) => setProfile({...profile, name: e.target.value})}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-blue-300 dark:focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(45,136,255,0.1)] transition-all duration-200"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Email</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="w-full text-sm px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-blue-300 dark:focus:border-blue-700 focus:shadow-[0_0_0_3px_rgba(45,136,255,0.1)] transition-all duration-200"
                    required
                  />
                </div>
                <div className="pt-1 space-y-2">
                  <button 
                    type="submit" 
                    disabled={savingProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20 disabled:opacity-60"
                  >
                    {savingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center justify-center gap-2 border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-60"
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
