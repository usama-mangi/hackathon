"use client";

import React, { useState } from "react";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { Lock, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";

interface VoteItem {
  id: string;
  submissionId: string;
  userId: string;
  score: number | null;
}

interface VotingPanelProps {
  submissionId: string;
  hackathonId: string;
  initialVotes: VoteItem[];
}

export default function VotingPanel({
  submissionId,
  hackathonId,
  initialVotes,
}: VotingPanelProps) {
  const { data: session, isPending } = useSession();
  const [votes, setVotes] = useState<VoteItem[]>(initialVotes);
  const [score, setScore] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute stats
  const validScores = votes.map((v) => v.score || 0).filter((s) => s > 0);
  const avgScore = validScores.length
    ? Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
    : 0;
  const minScore = validScores.length ? Math.min(...validScores) : 0;
  const maxScore = validScores.length ? Math.max(...validScores) : 0;

  // Check if current user has voted
  const userVote = session?.user
    ? votes.find((v) => v.userId === session.user.id)
    : null;

  const handleVoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await api(`/submission/${submissionId}/vote`, {
        method: "POST",
        body: JSON.stringify({ score }),
      });

      if (response) {
        // Add new vote to local list
        const newVote: VoteItem = {
          id: response.id || Math.random().toString(),
          submissionId,
          userId: session.user.id,
          score,
        };
        setVotes([...votes, newVote]);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error("Failed to cast vote:", err);
      setError(err?.message || "Only confirmed judges, organizers, or admins can vote.");
    } finally {
      setSubmitting(false);
    }
  };

  const userRole = (session?.user as any)?.role || "PARTICIPANT";
  const canVote = userRole === "ADMIN" || userRole === "ORGANIZER" || userRole === "JUDGE";

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
      {/* Header state */}
      {userVote ? (
        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-2 text-status-success text-xs font-semibold uppercase tracking-wider">
            <Lock className="h-4 w-4" />
            <span>Score is Locked</span>
          </div>
          <div className="font-display text-4xl font-bold text-primary">
            {userVote.score} <span className="text-on-surface-variant text-base font-normal">/ 10</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1.5">You have already graded this project.</p>
        </div>
      ) : (
        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex flex-col items-center text-center">
          <div className="font-display text-4xl font-bold text-primary">
            {avgScore} <span className="text-on-surface-variant text-base font-normal">/ 10</span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Average Community Grade ({votes.length} votes)</p>
        </div>
      )}

      {/* Main interface body */}
      <div className="p-6 flex flex-col gap-6">
        {/* Render stats break down */}
        <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant border-b border-outline-variant/60 pb-4">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-sans uppercase text-secondary font-bold mb-0.5">Average</span>
            <span className="text-sm text-on-surface font-semibold">{avgScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-sans uppercase text-secondary font-bold mb-0.5">Min Score</span>
            <span className="text-sm text-on-surface font-semibold">{minScore}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-sans uppercase text-secondary font-bold mb-0.5">Max Score</span>
            <span className="text-sm text-on-surface font-semibold">{maxScore}</span>
          </div>
        </div>

        {/* Voting UI slider or warning */}
        {isPending ? (
          <div className="h-20 bg-surface-container animate-pulse rounded-lg" />
        ) : !session ? (
          <div className="text-center p-4 bg-surface-container-low rounded-xl border border-outline-variant/50">
            <p className="text-xs text-on-surface-variant mb-3">Confirmed judges must sign in to grade submissions.</p>
            <Link
              href={`/sign-in?callbackUrl=/submissions/${submissionId}`}
              className="inline-block text-xs font-bold bg-primary-container text-on-primary px-4 py-2 rounded-lg hover:bg-opacity-95 transition-all shadow-sm"
            >
              Sign In to Vote
            </Link>
          </div>
        ) : userVote ? (
          <div className="bg-status-success/5 border border-status-success/20 rounded-xl p-4 text-xs text-status-success text-center">
            Your score of <strong>{userVote.score}</strong> has been saved. Thank you for voting!
          </div>
        ) : (
          <form onSubmit={handleVoteSubmit} className="space-y-4">
            <div>
              <label htmlFor="score-range" className="flex justify-between text-xs font-semibold text-on-surface mb-2">
                <span>Select Grade:</span>
                <span className="text-primary font-mono text-sm font-bold">{score} / 10</span>
              </label>
              <input
                id="score-range"
                type="range"
                min="1"
                max="10"
                step="1"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[10px] text-outline font-mono mt-1">
                <span>1 (Poor)</span>
                <span>5 (Average)</span>
                <span>10 (Excellent)</span>
              </div>
            </div>

            {error && (
              <div className="bg-status-error/10 border border-status-error/20 text-status-error px-3 py-2 rounded-lg text-[11px] flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-primary-container text-on-primary rounded font-label-caps text-label-caps hover:bg-opacity-95 transition-opacity disabled:opacity-75 disabled:cursor-not-allowed text-xs font-semibold"
            >
              {submitting ? "Submitting..." : "Submit Score"}
            </button>
          </form>
        )}
      </div>

      {/* Footer back button */}
      <div className="p-4 bg-surface-bright border-t border-outline-variant mt-auto">
        <Link
          href={`/hackathons/${hackathonId}/submissions`}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-outline-variant hover:bg-surface-container rounded text-xs font-semibold text-on-surface transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Submissions
        </Link>
      </div>
    </div>
  );
}
