'use client';

import { 
  Search, 
  Bell, 
  User, 
  RefreshCw, 
  AlertTriangle, 
  LogOut, 
  Menu,
  Terminal,
  MoreVertical,
  X
} from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSidebar } from "./SidebarContext";

export function Header() {
  const router = useRouter();
  const { isCollapsed, toggleCollapse, toggleMobileMenu } = useSidebar();
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleMobileMenu();
    } else {
      toggleCollapse();
    }
  };
  
  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    
    // Polling notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/exceptions/recent');
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.data || []);
          setUnreadCount(data.data?.length || 0);
        }
      } catch (err) {}
    };

    fetchNotifications();

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
    <header className="flex h-12 items-center justify-between border-b border-[#2D2E36] bg-[#1C1D22] px-3 sticky top-0 z-40 print:hidden select-none text-xs">
      {/* Left: Hamburger + PaySynapse Brand + Environment Selector Pill */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMenuClick}
          title="Toggle Navigation Menu"
          className="p-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#26272E] transition-colors"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2 mr-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.svg" alt="PaySynapse" className="h-5 w-5 rounded" />
          <span className="font-semibold text-sm tracking-tight text-[#E8EAED]">
            PaySynapse
          </span>
        </Link>
      </div>

      {/* Center: Search Box */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <div className="relative flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions, exceptions, orders (Ctrl + /)"
            className="w-full bg-[#131417] hover:bg-[#18191E] focus:bg-[#131417] text-[#E8EAED] placeholder-[#9AA0A6] text-xs rounded-full pl-9 pr-14 py-1.5 border border-[#2D2E36] focus:border-[#8AB4F8] outline-none transition-all"
          />
          <Search className="w-3.5 h-3.5 text-[#9AA0A6] absolute left-3 pointer-events-none" />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-9 text-[#9AA0A6] hover:text-[#E8EAED]"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <span className="absolute right-3 text-[10px] font-mono text-[#9AA0A6] bg-[#1C1D22] border border-[#2D2E36] px-1.5 py-0.5 rounded">
            /
          </span>
        </div>
      </div>

      {/* Right: Action Utilities */}
      <div className="flex items-center gap-1">
        {/* Sync / Refresh */}
        <button 
          onClick={() => window.location.reload()}
          title="Sync Ledger"
          className="p-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#26272E] transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            title="Notifications"
            className="relative p-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#26272E] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#1A73E8] text-[9px] font-bold text-white px-1">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-24px)] rounded-lg border border-[#2D2E36] bg-[#1C1D22] shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-[#2D2E36] bg-[#131417] font-semibold text-xs text-[#E8EAED] flex justify-between items-center">
                <span>Exception Alerts</span>
                <span className="text-[10px] text-[#8AB4F8]">{notifications.length} unresolved</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#2D2E36]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#9AA0A6]">
                    No open exception alerts
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <Link 
                      key={notif.id} 
                      href={`/exceptions/${notif.id}`}
                      onClick={() => setShowDropdown(false)}
                      className="block p-3 hover:bg-[#26272E] transition-colors"
                    >
                      <div className="font-medium text-[#E8EAED]">{notif.type.replace(/_/g, ' ')}</div>
                      <div className="text-[11px] text-[#9AA0A6] mt-0.5 line-clamp-2">{notif.description}</div>
                      <div className="text-[11px] font-mono text-[#8AB4F8] mt-1">
                        ₹{Number(notif.financialImpact || 0).toLocaleString('en-IN')} Variance
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* More Options / 3 dots */}
        <button 
          title="More options"
          className="p-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#26272E] transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {/* User Avatar */}
        <div className="relative ml-1" ref={profileRef}>
          <button 
            onClick={() => setShowProfile(!showProfile)}
            title="Account"
            className="w-7 h-7 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-xs hover:ring-2 hover:ring-[#8AB4F8] transition-all"
          >
            {profile?.name?.charAt(0)?.toUpperCase() || 'P'}
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] rounded-lg border border-[#2D2E36] bg-[#1C1D22] shadow-2xl z-50 overflow-hidden p-4 space-y-3">
              <div className="flex items-center gap-3 pb-3 border-b border-[#2D2E36]">
                <div className="w-9 h-9 rounded-full bg-[#1A73E8] text-white flex items-center justify-center font-bold text-sm">
                  {profile?.name?.charAt(0)?.toUpperCase() || 'P'}
                </div>
                <div>
                  <div className="font-semibold text-xs text-[#E8EAED]">{profile?.name || 'Operations Lead'}</div>
                  <div className="text-[11px] text-[#9AA0A6]">{profile?.email || 'ops@paysynapse.com'}</div>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2 py-1.5 rounded bg-[#26272E] hover:bg-[#2D2E36] text-[#E8EAED] text-xs font-medium transition-colors"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-400" />
                {loggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
