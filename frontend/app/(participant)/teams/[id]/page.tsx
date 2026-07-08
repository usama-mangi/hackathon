"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import {
  Users,
  Crown,
  Copy,
  Check,
  FileText,
  HelpCircle,
  ExternalLink,
  AlertCircle,
  Loader2,
  Plus,
  ChevronRight,
  GitBranch,
  Globe,
  Video,
  Ticket,
} from "lucide-react";

type TicketStatus = "OPEN" | "CLAIMED" | "RESOLVED";

const ticketStatusConfig: Record<TicketStatus, { cls: string; label: string }> = {
  OPEN: { cls: "bg-status-warning/15 text-status-warning", label: "OPEN" },
  CLAIMED: { cls: "bg-primary-container/15 text-primary", label: "CLAIMED" },
  RESOLVED: { cls: "bg-status-success/15 text-status-success", label: "RESOLVED" },
};

export default function TeamHubPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) loadTeam();
  }, [session, isPending]);

  async function loadTeam() {
    try {
      const data = await api(`/teams/${params.id}`);
      setTeam(data);
    } catch (err: any) {
      setError(
        err.message?.includes("403") || err.message?.toLowerCase().includes("forbidden")
          ? "You are not a member of this team."
          : err.message || "Failed to load team"
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    if (!team?.inviteCode) return;
    await navigator.clipboard.writeText(team.inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4 max-w-sm mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-status-error/10 flex items-center justify-center">
          <AlertCircle className="h-8 w-8 text-status-error" />
        </div>
        <h2 className="font-display font-bold text-xl text-on-surface">Access Denied</h2>
        <p className="text-sm text-on-surface-variant">{error}</p>
        <Link
          href="/dashboard"
          className="mt-2 px-5 py-2.5 rounded-xl bg-surface-container border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const currentUserId = (session?.user as any)?.id;
  const isLeader = team?.leaderId === currentUserId;
  const submission = team?.submission;
  const tickets: any[] = team?.tickets || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight">
            {team.name}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Team Hub — {team.hackathon?.name || "Hackathon"}
          </p>
        </div>
        {isLeader && (
          <span className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-status-warning/15 border border-status-warning/20 text-status-warning text-xs font-bold font-mono">
            <Crown className="h-3.5 w-3.5" />
            Team Leader
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — Members + Invite */}
        <div className="lg:col-span-1 space-y-4">
          {/* Members card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <h2 className="font-display font-semibold text-on-surface flex items-center gap-2 mb-4">
              <Users className="h-4 w-4 text-outline" />
              Team Members
              <span className="ml-auto text-xs font-mono text-on-surface-variant">{team.members?.length || 0}</span>
            </h2>
            <div className="space-y-3">
              {(team.members || []).map((member: any) => {
                const isLeaderBadge = member.userId === team.leaderId;
                return (
                  <div key={member.userId} className="flex items-center gap-3">
                    <div className="relative">
                      {member.user?.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name}
                          className="w-9 h-9 rounded-full object-cover border border-outline-variant"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary-container/15 text-primary font-bold text-sm flex items-center justify-center border border-primary-container/20">
                          {(member.user?.name || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                      {isLeaderBadge && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-status-warning rounded-full flex items-center justify-center">
                          <Crown className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {member.user?.name || "Unknown"}
                      </p>
                      {isLeaderBadge && (
                        <p className="text-[10px] font-mono font-bold text-status-warning">LEADER</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invite code */}
            <div className="mt-5 pt-4 border-t border-outline-variant">
              <p className="text-xs text-on-surface-variant mb-2">Invite Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-sm font-bold text-on-surface bg-surface-container px-3 py-2 rounded-lg border border-outline-variant tracking-widest">
                  {team.inviteCode || "XXXX-XXXX"}
                </code>
                <button
                  id="copy-invite-code"
                  onClick={copyCode}
                  title="Copy invite code"
                  className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                    codeCopied
                      ? "bg-status-success/15 border-status-success/30 text-status-success"
                      : "bg-surface-container border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {codeCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-2">
            <h2 className="font-display font-semibold text-on-surface text-sm mb-3">Quick Actions</h2>
            <Link
              href={`/teams/${params.id}/submission`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <FileText className="h-4 w-4" />
              {submission ? "Update Submission" : "Create Submission"}
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Link>
            <Link
              href={`/teams/${params.id}/tickets`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              <HelpCircle className="h-4 w-4 text-outline" />
              Request Support
              <ChevronRight className="h-4 w-4 ml-auto text-outline" />
            </Link>
            <Link
              href={`/teams/${params.id}/join`}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
            >
              <Plus className="h-4 w-4 text-outline" />
              Join via Invite Code
              <ChevronRight className="h-4 w-4 ml-auto text-outline" />
            </Link>
          </div>
        </div>

        {/* Right column — Submission + Tickets */}
        <div className="lg:col-span-2 space-y-4">
          {/* Submission block */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
                <FileText className="h-4 w-4 text-outline" />
                Project Submission
              </h2>
              <Link
                href={`/teams/${params.id}/submission`}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                {submission ? "Edit" : "Submit"}
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {submission ? (
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                    Project Title
                  </p>
                  <p className="font-display font-bold text-lg text-on-surface">{submission.title}</p>
                </div>
                {submission.description && (
                  <div>
                    <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                      Description
                    </p>
                    <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                      {submission.description}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {submission.repoUrl && (
                    <a
                      href={submission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <GitBranch className="h-3.5 w-3.5" />
                      Repository
                      <ExternalLink className="h-3 w-3 text-outline" />
                    </a>
                  )}
                  {submission.demoUrl && (
                    <a
                      href={submission.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Live Demo
                      <ExternalLink className="h-3 w-3 text-outline" />
                    </a>
                  )}
                  {submission.videoUrl && (
                    <a
                      href={submission.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Demo Video
                      <ExternalLink className="h-3 w-3 text-outline" />
                    </a>
                  )}
                </div>
                {typeof submission.submissionUpdates === "number" && (
                  <div className="flex items-center gap-2 mt-2 pt-3 border-t border-outline-variant">
                    <span className="text-xs text-on-surface-variant">Updates remaining:</span>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                      submission.submissionUpdates <= 1
                        ? "bg-status-error/15 text-status-error"
                        : "bg-surface-container text-on-surface"
                    }`}>
                      {submission.submissionUpdates} / 5
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center py-8 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                  <FileText className="h-6 w-6 text-outline" />
                </div>
                <p className="font-medium text-on-surface">No submission yet</p>
                <p className="text-sm text-on-surface-variant max-w-xs">
                  Submit your project to be eligible for judging. Include your code, demo, and video links.
                </p>
                <Link
                  href={`/teams/${params.id}/submission`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:opacity-90"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Submission
                </Link>
              </div>
            )}
          </div>

          {/* Support Tickets */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-on-surface flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-outline" />
                Support Tickets
              </h2>
              <Link
                href={`/teams/${params.id}/tickets`}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                New Ticket
                <Plus className="h-3 w-3" />
              </Link>
            </div>

            {tickets.length === 0 ? (
              <div className="flex flex-col items-center text-center py-8 gap-3">
                <Ticket className="h-10 w-10 text-outline" />
                <p className="text-sm text-on-surface-variant">No support tickets yet.</p>
                <Link
                  href={`/teams/${params.id}/tickets`}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Submit a help request
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {tickets.map((ticket: any) => {
                  const statusCfg = ticketStatusConfig[ticket.status as TicketStatus] || ticketStatusConfig.OPEN;
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-surface-container border border-outline-variant"
                    >
                      <p className="text-sm text-on-surface line-clamp-2 flex-1">{ticket.issue}</p>
                      <span className={`shrink-0 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${statusCfg.cls}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
