"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import {
  Trophy,
  Users,
  FileText,
  Award,
  Plus,
  ChevronRight,
  CalendarDays,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface HackathonEntry {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

interface TeamEntry {
  id: string;
  name: string;
  hackathonId: string;
}

export default function ParticipantDashboard() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [hackathons, setHackathons] = useState<HackathonEntry[]>([]);
  const [team, setTeam] = useState<TeamEntry | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) {
      loadDashboard();
    }
  }, [session, isPending]);

  async function loadDashboard() {
    try {
      const [hackathonsData, certsData] = await Promise.allSettled([
        api("/hackathon"),
        api("/certificates/me"),
      ]);
      if (hackathonsData.status === "fulfilled") {
        const all: HackathonEntry[] = hackathonsData.value || [];
        setHackathons(all);
      }
      if (certsData.status === "fulfilled") {
        setCertificates(certsData.value || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  const getStatus = (start: string, end: string, isActive: boolean) => {
    if (!isActive) return { label: "COMPLETED", cls: "bg-outline/10 text-secondary" };
    const now = new Date();
    if (now >= new Date(start) && now <= new Date(end))
      return { label: "LIVE", cls: "bg-status-success/15 text-status-success" };
    if (now < new Date(start))
      return { label: "UPCOMING", cls: "bg-status-warning/15 text-status-warning" };
    return { label: "COMPLETED", cls: "bg-outline/10 text-secondary" };
  };

  const userName = session?.user?.name?.split(" ")[0] || "there";

  const statCards = [
    {
      icon: Trophy,
      label: "Joined Hackathons",
      value: loading ? "—" : hackathons.length,
      color: "text-primary",
      bg: "bg-primary-container/10",
      href: null,
    },
    {
      icon: Users,
      label: "My Team",
      value: loading ? "—" : team ? team.name : "None",
      color: "text-status-success",
      bg: "bg-status-success/10",
      href: team ? `/teams/${team.id}` : null,
    },
    {
      icon: FileText,
      label: "Submission Status",
      value: "—",
      color: "text-status-warning",
      bg: "bg-status-warning/10",
      href: null,
    },
    {
      icon: Award,
      label: "Certificates Earned",
      value: loading ? "—" : certificates.length,
      color: "text-tertiary-container",
      bg: "bg-tertiary-container/20",
      href: "/certificates",
    },
  ];

  if (isPending || (loading && !error)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
            Hey, {userName} 👋
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Here&apos;s an overview of your hackathon activity.
          </p>
        </div>
        <Link
          href="/hackathons"
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Browse Hackathons <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const inner = (
            <div
              className={`relative flex flex-col gap-3 p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow ${card.href ? "cursor-pointer hover:border-primary/30" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-on-surface">{card.value}</p>
                <p className="text-xs text-on-surface-variant mt-0.5">{card.label}</p>
              </div>
              {card.href && (
                <ChevronRight className="absolute top-4 right-4 h-4 w-4 text-outline" />
              )}
            </div>
          );
          return card.href ? (
            <Link key={card.label} href={card.href}>
              {inner}
            </Link>
          ) : (
            <div key={card.label}>{inner}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/hackathons"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Trophy className="h-4 w-4" />
          Browse Hackathons
        </Link>
        <Link
          href="/teams"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
        >
          <Users className="h-4 w-4" />
          My Teams
        </Link>
        <Link
          href="/certificates"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
        >
          <Award className="h-4 w-4" />
          Certificates
        </Link>
      </div>

      {/* Active Hackathons */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-lg text-on-surface">
            All Hackathons
          </h2>
          <Link
            href="/hackathons"
            className="text-xs text-primary font-medium hover:underline"
          >
            View all
          </Link>
        </div>

        {hackathons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-outline-variant text-center">
            <Trophy className="h-12 w-12 text-outline mb-4" />
            <p className="font-semibold text-on-surface mb-1">No hackathons joined yet</p>
            <p className="text-sm text-on-surface-variant mb-5">
              Browse upcoming hackathons and join one to get started.
            </p>
            <Link
              href="/hackathons"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Find a Hackathon
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {hackathons.map((h) => {
              const status = getStatus(h.startsAt, h.endsAt, h.isActive);
              return (
                <div
                  key={h.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display font-semibold text-on-surface text-base leading-snug">
                      {h.name}
                    </h3>
                    <span className={`shrink-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant font-mono">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-outline" />
                      {new Date(h.startsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-outline" />
                      Ends {new Date(h.endsAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/hackathons/${h.id}`}
                      className="flex-1 text-center py-2 rounded-lg bg-surface-container border border-outline-variant text-xs font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/hackathons/${h.id}/teams/create`}
                      className="flex-1 text-center py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:opacity-90 transition-opacity"
                    >
                      Create Team
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
