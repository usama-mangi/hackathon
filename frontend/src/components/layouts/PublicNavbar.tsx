"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, authClient } from "@/src/lib/auth-client";
import { Menu, X, LogOut } from "lucide-react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const { data: session, isPending } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      window.location.reload();
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  const userRole = (session?.user as any)?.role || "PARTICIPANT";
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-status-error/10 text-status-error border border-status-error/20";
      case "ORGANIZER":
        return "bg-primary-container/10 text-primary border border-primary-container/20";
      default:
        return "bg-status-success/10 text-status-success border border-status-success/20";
    }
  };

  // Check if we are inside a single hackathon detail page.
  // Paths: /hackathons/[id] or /hackathons/[id]/events etc.
  const hackathonIdMatch = pathname?.match(/^\/hackathons\/([^\/]+)/);
  const hackathonId = hackathonIdMatch ? hackathonIdMatch[1] : null;

  const navLinks = hackathonId && pathname !== "/hackathons"
    ? [
        { name: "Overview", href: `/hackathons/${hackathonId}` },
        { name: "Schedule", href: `/hackathons/${hackathonId}/events` },
        { name: "Submissions", href: `/hackathons/${hackathonId}/submissions` },
        { name: "Announcements", href: `/hackathons/${hackathonId}/announcements` },
        { name: "Results", href: `/hackathons/${hackathonId}/results` },
      ]
    : [
        { name: "Explore Hackathons", href: "/hackathons" },
        { name: "Verify Certificate", href: "/certificates/verify/id" }, // Placeholder route
      ];

  return (
    <header className="bg-surface border-b border-outline-variant h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/hackathons" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 9h-6V3H5v12h6v6z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-on-surface">ProHack</span>
          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
            Epoch
          </span>
        </Link>

        {/* Desktop Main Navigation Links */}
        <nav className="hidden md:flex gap-6 h-full items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  isActive
                    ? "text-primary border-b-2 border-primary py-5"
                    : "text-on-surface-variant hover:text-primary py-5"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {/* User Session Info / Auth CTA */}
        {isPending ? (
          <div className="w-8 h-8 rounded-full bg-surface-container animate-pulse" />
        ) : session ? (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center text-xs font-semibold text-primary hover:underline"
            >
              Go to Dashboard
            </Link>
            <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors cursor-pointer group relative">
              {userImage ? (
                <img
                  src={userImage}
                  alt={userName}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary-container/15 text-primary text-xs font-bold flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-on-surface hidden md:inline">
                {userName}
              </span>

              {/* Quick Dropdown on hover */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg p-2 hidden group-hover:block z-50">
                <div className="px-3 py-2 border-b border-outline-variant mb-1">
                  <p className="text-xs font-bold text-on-surface truncate">{userName}</p>
                  <span className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${getRoleBadgeClass(userRole)}`}>
                    {userRole}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 text-xs font-medium text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-status-error hover:bg-status-error/5 rounded-lg transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-xs font-bold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="text-xs font-bold bg-primary-container text-on-primary px-3.5 py-2 rounded-lg hover:bg-opacity-90 transition-opacity"
            >
              Sign Up
            </Link>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative flex flex-col w-[260px] max-w-xs bg-surface-container-lowest h-full pt-4 border-r border-outline-variant shadow-xl">
            <div className="flex items-center justify-between px-6 pb-4 border-b border-outline-variant">
              <span className="font-display font-bold text-lg text-primary">ProHack</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-on-surface-variant hover:bg-surface-container-high"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-primary-container text-on-primary"
                        : "text-on-surface-variant hover:bg-surface-container"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-outline-variant bg-surface-container-low">
              {session ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {userImage ? (
                      <img
                        src={userImage}
                        alt={userName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-primary-container/15 text-primary font-bold flex items-center justify-center">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate leading-tight">{userName}</p>
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider ${getRoleBadgeClass(userRole)}`}>
                        {userRole}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary-container/5 rounded-lg border border-primary-container/20 transition-all"
                  >
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-status-error hover:bg-status-error/5 rounded-lg border border-status-error/10 transition-all"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-bold border border-outline-variant rounded-lg text-on-surface hover:bg-surface-container-high transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 text-xs font-bold bg-primary-container text-on-primary rounded-lg hover:bg-opacity-95 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
