import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr] print:block print:w-full">
      <div className="hidden border-r border-border/50 md:block bg-slate-50/50 dark:bg-slate-950/30 print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-col bg-mesh print:bg-none print:p-0">
        <Header />
        <main className="flex flex-1 flex-col p-0 m-0 w-full overflow-x-hidden print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
}
