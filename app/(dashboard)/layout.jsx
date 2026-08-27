import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export default function DashboardLayout({ children }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[256px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <Sidebar />
      </div>
      <div className="flex flex-col">
        <Header />
        <main className="flex flex-1 flex-col p-0 m-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
