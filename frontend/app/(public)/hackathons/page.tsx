import React from "react";
import Link from "next/link";
import { api } from "@/src/lib/api";
import JoinHackathonButton from "@/src/components/layouts/JoinHackathonButton";

// Force dynamic fetch to ensure live data
export const dynamic = "force-dynamic";

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

export default async function PublicHackathonsPage() {
  let hackathons: HackathonItem[] = [];
  let error: string | null = null;

  try {
    hackathons = await api("/hackathon");
  } catch (err: any) {
    console.error("Failed to fetch hackathons:", err);
    error = err?.message || "Could not retrieve hackathons. Please try again later.";
  }

  // Helper to determine status
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-grow flex flex-col">
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl tracking-tight text-on-surface">Explore Hackathons</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Browse active events, check out schedules and results, or join teams to build the future.
        </p>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {!error && hackathons.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
          <svg className="w-12 h-12 text-outline mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <h3 className="font-display font-semibold text-lg text-on-surface">No Hackathons Found</h3>
          <p className="text-sm text-on-surface-variant mt-1">There are no hackathons listed on the platform at the moment.</p>
        </div>
      )}

      {hackathons.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => {
            const status = getStatus(hackathon.startsAt, hackathon.endsAt, hackathon.isActive);
            const dateRange = formatDateRange(hackathon.startsAt, hackathon.endsAt);
            const isCompleted = status.label === "COMPLETED";

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

                  <p className="text-xs font-semibold text-primary font-mono mb-2">
                    {dateRange}
                  </p>

                  <p className="text-xs text-on-surface-variant line-clamp-3">
                    {hackathon.description || "No description provided for this hackathon."}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-outline-variant/60">
                  <div className="flex gap-4 text-xs text-on-surface-variant font-mono">
                    <div>
                      <span className="font-bold text-on-surface">{hackathon._count?.participants || 0}</span> hackers
                    </div>
                    <div>
                      <span className="font-bold text-on-surface">{hackathon._count?.teams || 0}</span> teams
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hackathons/${hackathon.id}`}
                      className="text-xs font-semibold text-on-surface-variant hover:text-primary border border-outline-variant hover:border-primary-container px-3 py-2 rounded-lg transition-all"
                    >
                      Details
                    </Link>
                    {!isCompleted && (
                      <JoinHackathonButton hackathonId={hackathon.id} />
                    )}
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
