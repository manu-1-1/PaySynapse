'use client';

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { SidebarProvider, useSidebar } from "@/components/SidebarContext";

function DashboardLayoutContent({ children }) {
  const { width, isDragging } = useSidebar();

  return (
    <div 
      className="flex min-h-screen w-full print:block print:w-full overflow-x-hidden"
    >
      {/* Dynamic width Sidebar */}
      <div 
        className={`hidden md:block print:hidden shrink-0 ${isDragging ? 'transition-none' : 'transition-all duration-150'}`}
        style={{ width: `${width}px` }}
      >
        <div className="fixed top-0 bottom-0 left-0 z-30" style={{ width: `${width}px` }}>
          <Sidebar />
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex flex-1 flex-col min-w-0 bg-[var(--background)] print:bg-none print:p-0"
      >
        <Header />
        <main className="flex flex-1 flex-col p-0 m-0 w-full overflow-x-hidden print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
