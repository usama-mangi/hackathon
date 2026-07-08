import React from "react";
import PublicNavbar from "@/src/components/layouts/PublicNavbar";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-body text-on-surface antialiased">
      {/* Top AppBar */}
      <PublicNavbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>

      {/* Simplified Public Footer */}
      <footer className="w-full py-6 px-4 md:px-8 border-t border-outline-variant bg-surface-container flex flex-col sm:flex-row justify-between items-center gap-4 text-xs mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center text-on-primary">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M19 9h-6V3H5v12h6v6z" />
            </svg>
          </div>
          <span className="font-display font-bold text-sm tracking-tight text-on-surface">ProHack</span>
        </div>
        <div className="text-on-surface-variant text-center">
          © {new Date().getFullYear()} ProHack Epoch. Built for the developer community.
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="text-on-surface-variant hover:text-primary transition-colors">Support</a>
        </div>
      </footer>
    </div>
  );
}
