import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import HackathonDetailTabs from "@/src/components/layouts/HackathonDetailTabs";

interface HackathonLayoutProps {
  children: React.ReactNode;
  params: Promise<any>;
}

export default async function SingleHackathonLayout({
  children,
  params,
}: HackathonLayoutProps) {
  const { id } = await params;
  let hackathon;

  try {
    hackathon = await api(`/hackathon/${id}`);
  } catch (err) {
    console.error("Failed to fetch hackathon detail:", err);
    notFound();
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
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
    return `${start.toLocaleDateString("en-US", options)} — ${end.toLocaleDateString("en-US", options)}`;
  };

  const status = getStatus(hackathon.startsAt, hackathon.endsAt, hackathon.isActive);
  const dateRange = formatDateRange(hackathon.startsAt, hackathon.endsAt);

  return (
    <div className="w-full flex-grow flex flex-col">
      {/* Hero Banner */}
      <section className="w-full bg-slate-900 py-10 px-4 md:px-8 relative overflow-hidden border-b border-outline-variant">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-white tracking-tight">
                {hackathon.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono tracking-wider border shrink-0 ${status.color}`}>
                {status.label}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-mono mt-1">
              {dateRange}
            </p>
          </div>
          {status.label === "LIVE" && (
            <div className="hidden md:block opacity-90">
              <span className="material-symbols-outlined text-[64px] text-status-warning animate-pulse">
                workspace_premium
              </span>
            </div>
          )}
        </div>
        {/* Subtle background grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />
      </section>

      {/* Detail Hub container */}
      <div className="max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex-grow flex flex-col gap-6">
        {/* Horizontal Sub-navigation tabs */}
        <HackathonDetailTabs hackathonId={id} />

        {/* Tab specific content children */}
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
}
