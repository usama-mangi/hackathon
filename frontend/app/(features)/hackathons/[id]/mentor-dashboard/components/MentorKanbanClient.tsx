"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Ticket,
  CheckCircle2,
  CircleDot,
  UserCheck,
  Clock,
  RefreshCw,
  AlertCircle,
  Check,
  Wifi,
  WifiOff,
  Users,
} from "lucide-react";
import { api } from "@/src/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TicketItem {
  id: string;
  hackathonId: string;
  teamId: string;
  issue: string;
  status: "OPEN" | "CLAIMED" | "RESOLVED";
  mentorId: string | null;
  createdAt: string;
  updatedAt: string;
  team: { id: string; name: string };
  mentor: { id: string; name: string; email: string } | null;
}

interface MentorKanbanClientProps {
  hackathon: { id: string; name: string };
  initialTickets: TicketItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Kanban Card ─────────────────────────────────────────────────────────────

function TicketCard({
  ticket,
  onClaim,
  onResolve,
  loadingId,
}: {
  ticket: TicketItem;
  onClaim: (id: string) => void;
  onResolve: (id: string) => void;
  loadingId: string | null;
}) {
  const isLoading = loadingId === ticket.id;
  const isResolved = ticket.status === "RESOLVED";

  return (
    <div
      className={`group rounded-2xl border p-4 space-y-3 shadow-sm transition-all duration-300 ${
        isResolved
          ? "bg-surface-container border-outline-variant/40 opacity-55 hover:opacity-70"
          : ticket.status === "OPEN"
          ? "bg-surface-container-lowest border-status-error/20 hover:border-status-error/40 hover:shadow-md"
          : "bg-surface-container-lowest border-status-warning/25 hover:border-status-warning/50 hover:shadow-md"
      }`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Link
            href={`/tickets/${ticket.id}`}
            className="text-xs font-bold text-on-surface hover:text-primary transition-colors truncate block"
          >
            #{ticket.id.slice(-6).toUpperCase()} · {ticket.team.name}
          </Link>
          <span className="text-[10px] text-outline font-mono flex items-center gap-1 mt-0.5">
            <Clock className="h-3 w-3" />
            {timeAgo(ticket.createdAt)}
          </span>
        </div>
        <Link
          href={`/tickets/${ticket.id}`}
          className="text-[10px] font-semibold text-on-surface-variant hover:text-primary transition-colors shrink-0 border border-outline-variant/60 rounded px-1.5 py-0.5"
        >
          View
        </Link>
      </div>

      {/* Issue preview */}
      <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3 bg-surface rounded-lg p-2.5 border border-outline-variant/30">
        {ticket.issue}
      </p>

      {/* Mentor row */}
      {ticket.mentor && (
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-status-warning/15 border border-status-warning/30 text-status-warning flex items-center justify-center text-[9px] font-bold shrink-0">
            {initials(ticket.mentor.name)}
          </div>
          <span className="text-[10px] text-on-surface-variant font-semibold truncate">
            {ticket.mentor.name}
          </span>
        </div>
      )}

      {/* Action button */}
      {ticket.status === "OPEN" && (
        <button
          onClick={() => onClaim(ticket.id)}
          disabled={isLoading}
          id={`claim-ticket-${ticket.id}`}
          className="w-full py-2.5 rounded-xl bg-primary-container text-on-primary text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Claiming…
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5" /> Claim Ticket
            </>
          )}
        </button>
      )}

      {ticket.status === "CLAIMED" && (
        <button
          onClick={() => onResolve(ticket.id)}
          disabled={isLoading}
          id={`resolve-ticket-${ticket.id}`}
          className="w-full py-2.5 rounded-xl bg-status-success text-on-primary text-xs font-bold tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Resolving…
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" /> Mark Resolved
            </>
          )}
        </button>
      )}

      {ticket.status === "RESOLVED" && (
        <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-status-success py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Resolved
        </div>
      )}
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KanbanColumn({
  title,
  status,
  tickets,
  icon,
  colorClass,
  badgeClass,
  onClaim,
  onResolve,
  loadingId,
}: {
  title: string;
  status: "OPEN" | "CLAIMED" | "RESOLVED";
  tickets: TicketItem[];
  icon: React.ReactNode;
  colorClass: string;
  badgeClass: string;
  onClaim: (id: string) => void;
  onResolve: (id: string) => void;
  loadingId: string | null;
}) {
  const colTickets = tickets.filter((t) => t.status === status);

  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-t-2xl border-b ${colorClass}`}
      >
        {icon}
        <span className="font-display font-bold text-sm tracking-tight">
          {title}
        </span>
        <span
          className={`ml-auto inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full text-[10px] font-bold font-mono ${badgeClass}`}
        >
          {colTickets.length}
        </span>
      </div>

      {/* Card list */}
      <div
        className={`flex-1 rounded-b-2xl border border-t-0 p-3 space-y-3 min-h-[240px] overflow-y-auto ${colorClass.replace("bg-", "border-").split(" ")[0]} border-outline-variant/30`}
      >
        {colTickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center py-8">
            <Ticket className="h-8 w-8 text-outline/30 mb-2" />
            <p className="text-xs text-outline/60 font-medium">No tickets here</p>
          </div>
        ) : (
          colTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onClaim={onClaim}
              onResolve={onResolve}
              loadingId={loadingId}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MentorKanbanClient({
  hackathon,
  initialTickets,
}: MentorKanbanClientProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [lastPolled, setLastPolled] = useState<Date>(new Date());
  const [pollError, setPollError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Long-polling ──────────────────────────────────────────────────────────
  const pollTickets = useCallback(async () => {
    try {
      const fresh = await api(`/hackathon/${hackathon.id}/tickets`);
      if (Array.isArray(fresh)) {
        setTickets(fresh);
        setLastPolled(new Date());
        setPollError(false);
      }
    } catch {
      setPollError(true);
    }
  }, [hackathon.id]);

  useEffect(() => {
    if (!isPolling) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(pollTickets, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPolling, pollTickets]);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Claim ─────────────────────────────────────────────────────────────────
  const handleClaim = async (ticketId: string) => {
    setLoadingId(ticketId);
    try {
      const response = await api(`/tickets/${ticketId}/claim`, {
        method: "PUT",
      });
      if (response) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: "CLAIMED" as const,
                  mentor: response.mentor || { id: "", name: "You", email: "" },
                  mentorId: response.mentorId || null,
                }
              : t
          )
        );
        showToast("success", "Ticket claimed — it's yours now.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to claim ticket.");
    } finally {
      setLoadingId(null);
    }
  };

  // ── Resolve ───────────────────────────────────────────────────────────────
  const handleResolve = async (ticketId: string) => {
    setLoadingId(ticketId);
    try {
      const response = await api(`/tickets/${ticketId}/resolve`, {
        method: "PUT",
      });
      if (response) {
        setTickets((prev) =>
          prev.map((t) =>
            t.id === ticketId ? { ...t, status: "RESOLVED" as const } : t
          )
        );
        showToast("success", "Ticket resolved! Great work.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to resolve ticket.");
    } finally {
      setLoadingId(null);
    }
  };

  const openCount = tickets.filter((t) => t.status === "OPEN").length;
  const claimedCount = tickets.filter((t) => t.status === "CLAIMED").length;
  const resolvedCount = tickets.filter((t) => t.status === "RESOLVED").length;

  return (
    <div className="space-y-6 font-body">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href={`/organizer/hackathons`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight flex items-center gap-2">
            <Ticket className="h-6 w-6 text-primary" />
            Mentor Support Board
          </h1>
          <p className="text-xs text-on-surface-variant">
            Real-time ticket queue for{" "}
            <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>

        {/* Polling status + controls */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[10px] text-outline font-mono">
            Last sync: {lastPolled.toLocaleTimeString()}
          </span>
          {pollError ? (
            <span className="flex items-center gap-1 text-[10px] text-status-error font-semibold">
              <WifiOff className="h-3.5 w-3.5" /> Connection lost
            </span>
          ) : isPolling ? (
            <span className="flex items-center gap-1 text-[10px] text-status-success font-semibold">
              <Wifi className="h-3.5 w-3.5" /> Live
            </span>
          ) : null}
          <button
            onClick={() => setIsPolling((v) => !v)}
            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all ${
              isPolling
                ? "bg-status-success/10 text-status-success border-status-success/20 hover:bg-status-success/20"
                : "bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high"
            }`}
          >
            {isPolling ? "Pause" : "Resume"}
          </button>
          <button
            onClick={pollTickets}
            className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-outline-variant hover:bg-surface-container transition-all text-on-surface-variant"
          >
            <RefreshCw className="h-3 w-3" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-status-error/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-status-error/10 text-status-error flex items-center justify-center shrink-0">
            <CircleDot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Open
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {openCount}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-status-warning/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Claimed
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {claimedCount}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-status-success/20 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Resolved
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {resolvedCount}
            </p>
          </div>
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-lg text-sm font-semibold border transition-all duration-300 ${
            toast.type === "success"
              ? "bg-status-success text-on-primary border-status-success/50"
              : "bg-status-error text-on-primary border-status-error/50"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* ── Kanban Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <KanbanColumn
          title="Open"
          status="OPEN"
          tickets={tickets}
          icon={<CircleDot className="h-4 w-4 text-status-error" />}
          colorClass="bg-status-error/5 border-status-error/15"
          badgeClass="bg-status-error/15 text-status-error"
          onClaim={handleClaim}
          onResolve={handleResolve}
          loadingId={loadingId}
        />
        <KanbanColumn
          title="Claimed"
          status="CLAIMED"
          tickets={tickets}
          icon={<UserCheck className="h-4 w-4 text-status-warning" />}
          colorClass="bg-status-warning/5 border-status-warning/15"
          badgeClass="bg-status-warning/15 text-status-warning"
          onClaim={handleClaim}
          onResolve={handleResolve}
          loadingId={loadingId}
        />
        <KanbanColumn
          title="Resolved"
          status="RESOLVED"
          tickets={tickets}
          icon={<CheckCircle2 className="h-4 w-4 text-status-success" />}
          colorClass="bg-status-success/5 border-status-success/15"
          badgeClass="bg-status-success/15 text-status-success"
          onClaim={handleClaim}
          onResolve={handleResolve}
          loadingId={loadingId}
        />
      </div>
    </div>
  );
}
