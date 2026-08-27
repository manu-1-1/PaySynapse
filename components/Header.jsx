'use client';

import { Search, Bell, User, RefreshCw, Sun, Moon, AlertTriangle } from "lucide-react"
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
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
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search transactions, exceptions..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3 rounded-md border h-9 text-sm outline-none px-3"
            />
          </div>
        </form>
      </div>
      <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
        <RefreshCw className="h-4 w-4" />
        Sync
      </button>
      <button 
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        {mounted ? (
          theme === 'dark' ? <Moon className="h-4 w-4 text-indigo-400" /> : <Sun className="h-4 w-4 text-amber-500" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Theme</span>
      </button>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={handleOpenNotifications}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-slate-950">
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </button>
        
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 rounded-xl border bg-white dark:bg-slate-950 shadow-lg z-50 overflow-hidden">
            <div className="p-3 border-b bg-slate-50/50 dark:bg-slate-900/50 font-semibold text-sm flex justify-between items-center">
              <span>Notifications</span>
              <span className="text-xs text-muted-foreground font-normal">{notifications.length} recent</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No new alerts.</div>
              ) : (
                notifications.map((notif) => (
                  <Link 
                    key={notif.id} 
                    href={`/exceptions/${notif.id}`}
                    onClick={() => setShowDropdown(false)}
                    className="block p-4 border-b hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors last:border-0"
                  >
                    <div className="flex items-start">
                      <AlertTriangle className={`w-4 h-4 mr-3 mt-0.5 flex-shrink-0 ${notif.severity === 'HIGH' ? 'text-rose-500' : 'text-amber-500'}`} />
                      <div>
                        <div className="text-sm font-medium">{notif.type.replace(/_/g, ' ')}</div>
                        <div className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.description}</div>
                        <div className="text-xs font-semibold mt-2 text-primary">{notif.financialImpact} INR Impact</div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
            <div className="p-2 border-t text-center">
              <Link href="/exceptions" onClick={() => setShowDropdown(false)} className="text-xs text-primary hover:underline font-medium">
                View all exceptions
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="relative" ref={profileRef}>
        <button 
          onClick={handleOpenProfile}
          className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-background hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <User className="h-4 w-4" />
          <span className="sr-only">Profile</span>
        </button>

        {showProfile && profile && (
          <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-white dark:bg-slate-950 shadow-lg z-50 overflow-hidden">
            <div className="p-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="font-semibold">{profile.name}</div>
              <div className="text-xs text-muted-foreground">{profile.role}</div>
            </div>
            <form onSubmit={handleProfileUpdate} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium">Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full text-sm px-3 py-2 rounded border bg-background"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">Email</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full text-sm px-3 py-2 rounded border bg-background"
                  required
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={savingProfile}
                  className="w-full bg-primary text-primary-foreground py-2 rounded text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </header>
  )
}
