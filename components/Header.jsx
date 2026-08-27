'use client';

import { Search, Bell, User, RefreshCw, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
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
      <button className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-background">
        <Bell className="h-4 w-4" />
        <span className="sr-only">Notifications</span>
      </button>
      <button className="relative flex h-8 w-8 items-center justify-center rounded-full border bg-background">
        <User className="h-4 w-4" />
        <span className="sr-only">Profile</span>
      </button>
    </header>
  )
}
