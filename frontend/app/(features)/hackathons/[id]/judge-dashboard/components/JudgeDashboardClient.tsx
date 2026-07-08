"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Trophy,
  FileText,
  Star,
  GitBranch,
  Link2,
  Video,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  Users,
  BarChart3,
  SortAsc,
  ChevronRight,
} from "lucide-react";
import { api } from "@/src/lib/api";
import VotingPanel from "@/src/components/layouts/VotingPanel";
import VideoPlayer from "@/src/components/ui/VideoPlayer";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SubmissionListItem {
  id: string;
  teamId: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
    inviteCode: string;
    leaderId: string;
  };
}

interface SubmissionDetail extends SubmissionListItem {
  team: {
    id: string;
    name: string;
    inviteCode: string;
    leaderId: string;
    members?: Array<{
      id: string;
      userId: string;
      user: { id: string; name: string; image: string | null };
    }>;
  };
  votes: Array<{
    id: string;
    submissionId: string;
    userId: string;
    score: number | null;
  }>;
}

interface JudgeDashboardClientProps {
  hackathon: { id: string; name: string };
  initialSubmissions: SubmissionListItem[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function avgScore(votes: { score: number | null }[]) {
  const valid = votes.map((v) => v.score ?? 0).filter((s) => s > 0);
  if (!valid.length) return null;
  return Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10;
}

// ─── Score Badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score, count }: { score: number | null; count: number }) {
  if (count === 0) {
    return (
      <span className="text-[10px] font-mono text-outline italic">ungraded</span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold text-primary bg-primary-container/10 px-1.5 py-0.5 rounded border border-primary-container/20">
      <Star className="h-3 w-3 fill-primary text-primary" />
      {score ?? "—"} / 10
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JudgeDashboardClient({
  hackathon,
  initialSubmissions,
}: JudgeDashboardClientProps) {
  const [submissions, setSubmissions] = useState<SubmissionListItem[]>(
    // Sort by vote count ascending (ungraded first)
    [...initialSubmissions].sort((a, b) => {
      // we don't have vote counts here; use createdAt as fallback
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    })
  );
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Polling
  const [isPolling, setIsPolling] = useState(true);
  const [lastPolled, setLastPolled] = useState<Date>(new Date());
  const [pollError, setPollError] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Long-polling submissions list ─────────────────────────────────────────
  const pollSubmissions = useCallback(async () => {
    try {
      const fresh = await api(`/hackathon/${hackathon.id}/submissions`);
      if (Array.isArray(fresh)) {
        setSubmissions(fresh);
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
    intervalRef.current = setInterval(pollSubmissions, 20000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPolling, pollSubmissions]);

  // ── Fetch detail on selection ─────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    const fetch = async () => {
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const data = await api(`/submission/${selectedId}`);
        setDetail(data);
      } catch (err: any) {
        setDetailError(err?.message || "Failed to load submission details.");
      } finally {
        setLoadingDetail(false);
      }
    };
    fetch();
  }, [selectedId]);

  const filtered = submissions.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.team.name.toLowerCase().includes(search.toLowerCase())
  );

  const gradedCount = submissions.filter((s) => {
    // We can't know grade count from list view, so this is just a UI count placeholder
    return false;
  }).length;

  return (
    <div className="space-y-6 font-body">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Judge Scoring Dashboard
          </h1>
          <p className="text-xs text-on-surface-variant">
            Grade submissions for{" "}
            <strong className="text-on-surface">{hackathon.name}</strong>
            <span className="ml-2 font-mono text-outline">
              · {submissions.length} total
            </span>
          </p>
        </div>

        {/* Polling controls */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-outline font-mono hidden md:block">
            {lastPolled.toLocaleTimeString()}
          </span>
          {pollError ? (
            <span className="flex items-center gap-1 text-[10px] text-status-error font-semibold">
              <WifiOff className="h-3.5 w-3.5" /> Offline
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
                ? "bg-status-success/10 text-status-success border-status-success/20"
                : "bg-surface-container text-on-surface-variant border-outline-variant"
            }`}
          >
            {isPolling ? "Pause" : "Resume"}
          </button>
          <button
            onClick={pollSubmissions}
            className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-outline-variant hover:bg-surface-container transition-all text-on-surface-variant"
          >
            <RefreshCw className="h-3 w-3" /> Sync
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Total
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {submissions.length}
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Star className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Scoring
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              1–10
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-surface-container text-outline flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
              Selected
            </p>
            <p className="font-display text-xl font-bold text-on-surface">
              {selectedId ? "1" : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Split layout ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── LEFT: Submission list ─────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <input
              id="judge-search"
              type="text"
              placeholder="Search project or team…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-on-surface-variant font-semibold flex items-center gap-1">
              <SortAsc className="h-3 w-3" /> Submissions ({filtered.length})
            </span>
          </div>

          {/* List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="divide-y divide-outline-variant/50 max-h-[65vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <Trophy className="h-10 w-10 text-outline/30 mb-2" />
                  <p className="text-xs text-on-surface-variant">
                    No submissions found
                  </p>
                </div>
              ) : (
                filtered.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedId(sub.id)}
                    className={`w-full text-left px-4 py-3.5 hover:bg-surface-container transition-colors group ${
                      selectedId === sub.id
                        ? "bg-primary-container/5 border-l-[3px] border-primary"
                        : "border-l-[3px] border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-xs text-on-surface block truncate">
                          {sub.title}
                        </span>
                        <span className="text-[11px] text-on-surface-variant font-semibold flex items-center gap-1 mt-0.5">
                          <Users className="h-3 w-3 text-outline" />
                          {sub.team.name}
                        </span>
                        <span className="text-[10px] text-outline font-mono block mt-0.5">
                          {new Date(sub.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <ChevronRight
                        className={`h-4 w-4 shrink-0 mt-0.5 transition-colors ${
                          selectedId === sub.id
                            ? "text-primary"
                            : "text-outline/50 group-hover:text-outline"
                        }`}
                      />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Detail + Voting ─────────────────────────────────────── */}
        <div className="lg:col-span-8">
          {!selectedId ? (
            // Empty state
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-16 text-center shadow-sm">
              <Trophy className="h-14 w-14 text-amber-400/40 mx-auto mb-4" />
              <h3 className="font-display font-bold text-on-surface text-base">
                Select a submission
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 max-w-xs mx-auto leading-relaxed">
                Pick a project from the list to review its details and cast your
                score. Ungraded submissions are prioritized at the top.
              </p>
            </div>
          ) : loadingDetail ? (
            // Loading skeleton
            <div className="space-y-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 animate-pulse space-y-4">
                <div className="h-5 bg-surface-container rounded w-1/3" />
                <div className="h-20 bg-surface-container rounded-xl" />
                <div className="h-8 bg-surface-container rounded-xl w-1/2" />
              </div>
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 animate-pulse h-40" />
            </div>
          ) : detailError ? (
            <div className="bg-status-error/10 border border-status-error/20 text-status-error p-6 rounded-2xl flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span className="text-sm font-semibold">{detailError}</span>
            </div>
          ) : detail ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              {/* Details — 7 cols */}
              <div className="xl:col-span-7 space-y-5">
                {/* Project card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
                    <h2 className="font-display font-bold text-base text-on-surface leading-snug">
                      {detail.title}
                    </h2>
                    <p className="text-xs text-on-surface-variant font-semibold mt-1">
                      Team:{" "}
                      <strong className="text-on-surface">{detail.team.name}</strong>
                    </p>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Description */}
                    <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-xl border border-outline-variant/40">
                      {detail.description}
                    </p>

                    {/* Resources */}
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                        Resources
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        {detail.repoUrl ? (
                          <a
                            href={detail.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                          >
                            <GitBranch className="h-4 w-4 text-outline shrink-0" />
                            <span className="truncate">Repository</span>
                            <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container border border-outline-variant/35 text-outline">
                            <GitBranch className="h-4 w-4 shrink-0" />
                            <span>No Repo</span>
                          </div>
                        )}
                        {detail.demoUrl ? (
                          <a
                            href={detail.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-xl bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                          >
                            <Link2 className="h-4 w-4 text-outline shrink-0" />
                            <span className="truncate">Live Demo</span>
                            <ExternalLink className="h-3 w-3 ml-auto shrink-0" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-container border border-outline-variant/35 text-outline">
                            <Link2 className="h-4 w-4 shrink-0" />
                            <span>No Demo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                    <Video className="h-4 w-4 text-outline" />
                    <h3 className="font-display font-bold text-sm text-on-surface">
                      Demo Video
                    </h3>
                  </div>
                  <div className="p-6">
                    <VideoPlayer videoUrl={detail.videoUrl} title={detail.title} />
                  </div>
                </div>
              </div>

              {/* Voting panel — 5 cols */}
              <div className="xl:col-span-5 xl:sticky xl:top-8">
                <VotingPanel
                  submissionId={detail.id}
                  hackathonId={hackathon.id}
                  initialVotes={detail.votes}
                />

                {/* Vote breakdown */}
                <div className="mt-4 bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="h-4 w-4 text-outline" />
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                      Score breakdown
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase mb-1">
                        Votes
                      </p>
                      <p className="font-display font-bold text-on-surface text-lg">
                        {detail.votes.length}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase mb-1">
                        Average
                      </p>
                      <p className="font-display font-bold text-primary text-lg">
                        {avgScore(detail.votes) ?? "—"}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold uppercase mb-1">
                        Total
                      </p>
                      <p className="font-display font-bold text-on-surface text-lg">
                        {detail.votes.reduce((a, v) => a + (v.score ?? 0), 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
