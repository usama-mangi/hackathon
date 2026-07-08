"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Users,
  UserCheck,
  CheckCircle2,
  CircleDot,
  RefreshCw,
  AlertCircle,
  Check,
  Terminal,
  Tag,
  BadgeInfo,
  ExternalLink,
} from "lucide-react";
import { api } from "@/src/lib/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TeamMember {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface TicketDetail {
  id: string;
  hackathonId: string;
  teamId: string;
  issue: string;
  status: "OPEN" | "CLAIMED" | "RESOLVED";
  mentorId: string | null;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    members: TeamMember[];
  };
  mentor: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  hackathon: {
    id: string;
    name: string;
  };
}

interface TicketDetailClientProps {
  ticket: TicketDetail;
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

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig = {
  OPEN: {
    label: "Open",
    icon: CircleDot,
    bg: "bg-status-error/10",
    border: "border-status-error/20",
    text: "text-status-error",
    badge: "bg-status-error/15 text-status-error border-status-error/20",
  },
  CLAIMED: {
    label: "Claimed",
    icon: UserCheck,
    bg: "bg-status-warning/10",
    border: "border-status-warning/20",
    text: "text-status-warning",
    badge: "bg-status-warning/15 text-status-warning border-status-warning/20",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    bg: "bg-status-success/10",
    border: "border-status-success/20",
    text: "text-status-success",
    badge: "bg-status-success/15 text-status-success border-status-success/20",
  },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({
  name,
  image,
  size = "md",
}: {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm"
      ? "w-6 h-6 text-[9px]"
      : size === "lg"
      ? "w-12 h-12 text-sm"
      : "w-8 h-8 text-xs";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border border-outline-variant`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-primary-container/15 text-primary font-bold flex items-center justify-center border border-primary-container/20`}
    >
      {initials(name)}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TicketDetailClient({ ticket: initialTicket }: TicketDetailClientProps) {
  const [ticket, setTicket] = useState<TicketDetail>(initialTicket);
  const [loadingAction, setLoadingAction] = useState<"claim" | "resolve" | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const cfg = statusConfig[ticket.status];
  const StatusIcon = cfg.icon;

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Claim ─────────────────────────────────────────────────────────────────
  const handleClaim = async () => {
    setLoadingAction("claim");
    try {
      const response = await api(`/tickets/${ticket.id}/claim`, { method: "PUT" });
      if (response) {
        setTicket((prev) => ({
          ...prev,
          status: "CLAIMED",
          mentor: response.mentor || null,
          mentorId: response.mentorId || null,
        }));
        showToast("success", "You have claimed this ticket.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to claim ticket.");
    } finally {
      setLoadingAction(null);
    }
  };

  // ── Resolve ───────────────────────────────────────────────────────────────
  const handleResolve = async () => {
    setLoadingAction("resolve");
    try {
      const response = await api(`/tickets/${ticket.id}/resolve`, { method: "PUT" });
      if (response) {
        setTicket((prev) => ({ ...prev, status: "RESOLVED" }));
        showToast("success", "Ticket has been marked as resolved.");
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to resolve ticket.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-on-surface-variant">
        <Link
          href={`/hackathons/${ticket.hackathonId}/mentor-dashboard`}
          className="flex items-center gap-1.5 font-semibold hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Support Board
        </Link>
        <span>/</span>
        <span className="text-on-surface font-mono font-semibold">
          #{ticket.id.slice(-8).toUpperCase()}
        </span>
      </div>

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            Ticket Detail
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Submitted by team{" "}
            <strong className="text-on-surface">{ticket.team.name}</strong> ·{" "}
            {ticket.hackathon.name}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${cfg.badge}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </span>
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT: Issue Details ────────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">
          {/* Issue description */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
              <BadgeInfo className="h-4 w-4 text-outline" />
              <h2 className="font-display font-bold text-sm text-on-surface">
                Issue Description
              </h2>
              <span className="ml-auto text-[10px] text-outline font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(ticket.createdAt)}
              </span>
            </div>
            <div className="p-6">
              <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                {ticket.issue}
              </p>
            </div>
          </div>

          {/* Traceback / Technical context */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-inverse-surface/5 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-outline" />
              <h2 className="font-display font-bold text-sm text-on-surface">
                Technical Context
              </h2>
              <span className="ml-auto text-[10px] text-outline font-mono">
                Submitted traceback / error info
              </span>
            </div>
            <div className="p-4">
              <pre className="font-mono text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-inverse-surface/5 border border-outline-variant/40 rounded-xl p-4 overflow-x-auto max-h-64 scrollbar-thin">
                {ticket.issue}
              </pre>
            </div>
          </div>

          {/* Team members */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
              <Users className="h-4 w-4 text-outline" />
              <h2 className="font-display font-bold text-sm text-on-surface">
                Team — {ticket.team.name}
              </h2>
              <span className="ml-auto text-[10px] font-semibold text-on-surface-variant font-mono">
                {ticket.team.members?.length ?? 0} member
                {ticket.team.members?.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="divide-y divide-outline-variant/50">
              {ticket.team.members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 px-6 py-3"
                >
                  <Avatar
                    name={member.user.name}
                    image={member.user.image}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-on-surface truncate">
                      {member.user.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-mono truncate">
                      {member.user.email}
                    </p>
                  </div>
                </div>
              ))}
              {(!ticket.team.members || ticket.team.members.length === 0) && (
                <div className="px-6 py-4 text-xs text-outline text-center">
                  No members found
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Status & Actions ────────────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-8">
          {/* Status card */}
          <div
            className={`bg-surface-container-lowest rounded-2xl border shadow-sm overflow-hidden ${cfg.border}`}
          >
            <div
              className={`px-6 py-5 ${cfg.bg} border-b ${cfg.border} flex items-center gap-3`}
            >
              <div
                className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center ${cfg.text}`}
              >
                <StatusIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Current Status
                </p>
                <p className={`font-display font-bold text-lg ${cfg.text}`}>
                  {cfg.label}
                </p>
              </div>
            </div>

            {/* Ticket metadata */}
            <div className="px-6 py-5 space-y-4 border-b border-outline-variant">
              <div className="space-y-2">
                <MetaRow
                  label="Ticket ID"
                  value={`#${ticket.id.slice(-8).toUpperCase()}`}
                  mono
                />
                <MetaRow
                  label="Created"
                  value={formatDateTime(ticket.createdAt)}
                  mono
                />
                <MetaRow
                  label="Last Updated"
                  value={formatDateTime(ticket.updatedAt)}
                  mono
                />
                <MetaRow label="Team" value={ticket.team.name} />
                <MetaRow
                  label="Team Size"
                  value={`${ticket.team.members?.length ?? "—"} members`}
                />
                <MetaRow label="Hackathon" value={ticket.hackathon.name} />
              </div>
            </div>

            {/* Mentor info */}
            <div className="px-6 py-5 border-b border-outline-variant">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                Assigned Mentor
              </p>
              {ticket.mentor ? (
                <div className="flex items-center gap-3">
                  <Avatar
                    name={ticket.mentor.name}
                    image={ticket.mentor.image}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-on-surface truncate">
                      {ticket.mentor.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-mono truncate">
                      {ticket.mentor.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-outline italic">
                  No mentor assigned yet
                </p>
              )}
            </div>

            {/* Big action button */}
            <div className="px-6 py-5">
              {ticket.status === "OPEN" && (
                <button
                  onClick={handleClaim}
                  disabled={loadingAction === "claim"}
                  id="claim-ticket-btn"
                  className="w-full py-4 rounded-2xl bg-primary-container text-on-primary font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2 shadow-md"
                >
                  {loadingAction === "claim" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Claiming…
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4" />
                      Claim This Ticket
                    </>
                  )}
                </button>
              )}

              {ticket.status === "CLAIMED" && (
                <button
                  onClick={handleResolve}
                  disabled={loadingAction === "resolve"}
                  id="resolve-ticket-btn"
                  className="w-full py-4 rounded-2xl bg-status-success text-on-primary font-bold text-sm tracking-wide hover:opacity-90 active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center gap-2 shadow-md"
                >
                  {loadingAction === "resolve" ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Resolving…
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Mark as Resolved
                    </>
                  )}
                </button>
              )}

              {ticket.status === "RESOLVED" && (
                <div className="w-full py-4 rounded-2xl bg-status-success/10 border border-status-success/20 text-status-success font-bold text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Ticket Resolved
                </div>
              )}

              {/* Back to board link */}
              <Link
                href={`/hackathons/${ticket.hackathonId}/mentor-dashboard`}
                className="w-full mt-3 py-3 rounded-2xl border border-outline-variant text-on-surface-variant font-semibold text-xs hover:bg-surface-container transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View Full Board
              </Link>
            </div>
          </div>

          {/* Activity indicator */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 space-y-2 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Tag className="h-3.5 w-3.5 text-outline" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Activity
              </span>
            </div>
            <div className="space-y-2 text-xs text-on-surface-variant">
              <div className="flex justify-between">
                <span>Ticket created</span>
                <span className="font-mono text-outline">
                  {formatDateTime(ticket.createdAt)}
                </span>
              </div>
              {ticket.status !== "OPEN" && (
                <div className="flex justify-between">
                  <span>
                    {ticket.status === "CLAIMED" ? "Claimed by mentor" : "Resolved"}
                  </span>
                  <span className="font-mono text-outline">
                    {formatDateTime(ticket.updatedAt)}
                  </span>
                </div>
              )}
            </div>
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
    </div>
  );
}

// ─── Small helper ─────────────────────────────────────────────────────────────

function MetaRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wide shrink-0">
        {label}
      </span>
      <span
        className={`text-xs text-on-surface text-right ${mono ? "font-mono" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
