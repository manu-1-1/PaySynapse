import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "./context/StoreContext";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Neon Store - Premium E-Commerce",
  description: "A premium merchant storefront demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0a] text-white min-h-screen flex flex-col`}>
        <StoreProvider>
          {/* Navigation Bar */}
          <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Neon Store
              </Link>
              <div className="flex gap-6 text-sm font-medium text-gray-300">
                <Link href="/" className="hover:text-white transition-colors">Shop</Link>
                <Link href="/orders" className="hover:text-white transition-colors">My Orders</Link>
              </div>
            </div>
          </nav>
          
          <main className="flex-1 max-w-6xl w-full mx-auto p-4">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
