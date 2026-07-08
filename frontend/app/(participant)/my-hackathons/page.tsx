"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { Trophy, CalendarDays, Clock, Loader2, AlertCircle, Plus, ChevronRight } from "lucide-react";

interface HackathonItem {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  _count?: {
    participants: number;
    teams: number;
  };
}

export default function MyJoinedHackathonsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [hackathons, setHackathons] = useState<HackathonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) {
      loadJoinedHackathons();
    }
  }, [session, isPending]);

  async function loadJoinedHackathons() {
    try {
      const data = await api("/hackathon/me/joined");
      setHackathons(data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load your hackathons");
    } finally {
      setLoading(false);
    }
  }

  const getStatus = (startStr: string, endStr: string, isActive: boolean) => {
    if (!isActive) return { label: "COMPLETED", color: "bg-outline/10 text-secondary border-outline/20" };
    const now = new Date();
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (now > end) {
      return { label: "COMPLETED", color: "bg-outline/10 text-secondary border-outline/20" };
    } else if (now >= start && now <= end) {
      return { label: "LIVE", color: "bg-status-success/15 text-status-success border-status-success/20 font-semibold" };
    } else {
      return { label: "UPCOMING", color: "bg-status-warning/15 text-status-warning border-status-warning/20 font-semibold" };
    }
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const startFormatted = start.toLocaleDateString("en-US", options);
    
    if (start.getFullYear() !== end.getFullYear()) {
      return `${startFormatted}, ${start.getFullYear()} - ${end.toLocaleDateString("en-US", { ...options, year: "numeric" })}`;
    }
    if (start.getMonth() === end.getMonth()) {
      return `${startFormatted} - ${end.getDate()}, ${end.getFullYear()}`;
    }
    return `${startFormatted} - ${end.toLocaleDateString("en-US", options)}, ${end.getFullYear()}`;
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight mb-1">
          My Hackathons
        </h1>
        <p className="text-sm text-on-surface-variant">
          Hackathons you have registered for and are currently participating in.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty State */}
      {hackathons.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-lowest">
          <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-outline" />
          </div>
          <h3 className="font-display font-semibold text-lg text-on-surface">No Registered Hackathons</h3>
          <p className="text-sm text-on-surface-variant mt-1 max-w-sm mx-auto">
            You haven&apos;t joined any hackathons yet. Explore the available events to get started!
          </p>
          <Link
            href="/hackathons"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity mt-4"
          >
            <Plus className="h-4 w-4" />
            Explore Hackathons
          </Link>
        </div>
      )}

      {/* Hackathons Grid */}
      {hackathons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => {
            const status = getStatus(hackathon.startsAt, hackathon.endsAt, hackathon.isActive);
            const dateRange = formatDateRange(hackathon.startsAt, hackathon.endsAt);

            return (
              <div
                key={hackathon.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-display font-bold text-lg text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {hackathon.name}
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider border shrink-0 ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-primary font-mono mb-2 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-outline" />
                    {dateRange}
                  </p>

                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {hackathon.description || "No description provided for this hackathon."}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-outline-variant/60">
                  <div className="flex gap-4 text-xs text-on-surface-variant font-mono">
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-on-surface">{hackathon._count?.participants || 0}</span> hackers
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-bold text-on-surface">{hackathon._count?.teams || 0}</span> teams
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hackathons/${hackathon.id}`}
                      className="text-xs font-semibold text-on-surface-variant hover:text-primary border border-outline-variant hover:border-primary-container px-3.5 py-2 rounded-lg transition-all"
                    >
                      Workspace
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
