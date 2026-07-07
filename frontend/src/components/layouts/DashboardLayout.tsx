"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, authClient } from "@/src/lib/auth-client";
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  HelpCircle, 
  Award, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(
    "Welcome to Epoch! Complete your profile to join upcoming hackathons."
  );

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Hackathons", href: "/hackathons", icon: Trophy },
    { name: "My Team", href: "/team", icon: Users },
    { name: "Support", href: "/support", icon: HelpCircle },
    { name: "Certificates", href: "/certificates", icon: Award },
    { name: "Profile Settings", href: "/settings", icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  // Get user role with a fallback. Cast user to any since we added custom role field.
  const userRole = (session?.user as any)?.role || "PARTICIPANT";
  const userName = session?.user?.name || "Anonymous User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image;

  // Determine badge colors based on role
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-status-error/10 text-status-error border border-status-error/20";
      case "ORGANIZER":
        return "bg-primary-container/10 text-primary border border-primary-container/20";
      default: // PARTICIPANT
        return "bg-status-success/10 text-status-success border border-status-success/20";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-body text-on-surface antialiased">
      {/* Global Alert Banner */}
      {alertBanner && (
        <div className="bg-primary-container text-on-primary-container text-xs px-4 py-2 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2 mx-auto">
            <span className="inline-flex items-center justify-center p-1 rounded-full bg-on-primary-container/10 text-primary-fixed">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium">{alertBanner}</span>
          </div>
          <button 
            onClick={() => setAlertBanner(null)} 
            className="text-on-primary-container/70 hover:text-on-primary-container transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="flex flex-1 relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-[260px] bg-surface-container-lowest border-r border-outline-variant fixed inset-y-0 left-0 z-20 pt-[alertBanner ? 40px : 0px]">
          {/* Header/Logo */}
          <div className="h-16 flex items-center px-6 border-b border-outline-variant gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
              {/* Lightning Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 9h-6V3H5v12h6v6z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-on-surface">ProHack</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">Epoch</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-on-primary" : "text-outline group-hover:text-on-surface"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Profile Footer Card */}
          <div className="p-4 border-t border-outline-variant bg-surface-container-low">
            <div className="flex items-center gap-3 mb-3">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border border-outline"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary-container/15 text-primary font-bold flex items-center justify-center border border-primary-container/20">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate leading-tight">{userName}</p>
                <p className="text-xs text-on-surface-variant truncate mb-1">{userEmail}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${getRoleBadgeClass(userRole)}`}>
                  {userRole}
                </span>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-status-error hover:bg-status-error/5 rounded-lg border border-status-error/10 hover:border-status-error/20 transition-all duration-150"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between w-full h-16 px-4 bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M19 9h-6V3H5v12h6v6z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-tight text-on-surface">ProHack</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30 flex">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            
            {/* Sidebar Content */}
            <aside className="relative flex flex-col w-[260px] max-w-xs bg-surface-container-lowest h-full pt-4 border-r border-outline-variant shadow-xl">
              <div className="flex items-center justify-between px-6 pb-4 border-b border-outline-variant">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 9h-6V3H5v12h6v6z"/>
                    </svg>
                  </div>
                  <span className="font-display font-bold text-lg tracking-tight">ProHack</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-primary-container text-on-primary"
                          : "text-on-surface-variant hover:bg-surface-container"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              {/* Profile Footer */}
              <div className="p-4 border-t border-outline-variant bg-surface-container-low">
                <div className="flex items-center gap-3 mb-3">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover border border-outline"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-container/15 text-primary font-bold flex items-center justify-center border border-primary-container/20">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate leading-tight">{userName}</p>
                    <p className="text-xs text-on-surface-variant truncate mb-1">{userEmail}</p>
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${getRoleBadgeClass(userRole)}`}>
                      {userRole}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-status-error hover:bg-status-error/5 rounded-lg border border-status-error/10 hover:border-status-error/20 transition-all duration-150"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col md:pl-[260px] pt-16 md:pt-0">
          <div className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
