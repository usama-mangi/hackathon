import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Trophy, 
  Users, 
  Award, 
  Star, 
  MessageSquare,
  Sparkles
} from "lucide-react";
import { api } from "@/src/lib/api";

export const dynamic = "force-dynamic";

interface LeaderboardEntry {
  id: string;
  teamId: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  totalScore: number;
  voteCount: number;
  team: {
    id: string;
    name: string;
    inviteCode: string;
    hackathonId: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ResultsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let leaderboard: LeaderboardEntry[] = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    leaderboard = await api(`/hackathon/${id}/results`);
  } catch (error) {
    console.error(`Failed to load results for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  const getPlacementBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-800 font-bold border border-amber-200 text-xs">
            <Trophy className="h-3.5 w-3.5 text-amber-600 fill-amber-600" />
            1st Place
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-bold border border-slate-200 text-xs">
            <Award className="h-3.5 w-3.5 text-slate-500 fill-slate-500" />
            2nd Place
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 font-bold border border-amber-100 text-xs">
            <Award className="h-3.5 w-3.5 text-amber-700 fill-amber-700" />
            3rd Place
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-surface-container text-on-surface-variant font-mono font-bold text-xs">
            #{index + 1}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" /> Leaderboard & Results
          </h1>
          <p className="text-xs text-on-surface-variant">
            Official grading standings and placement rankings for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <h2 className="font-display font-bold text-sm text-on-surface">Final Standings</h2>
          <span className="text-xs font-mono text-outline flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Auto-sorted by total score
          </span>
        </div>

        <div className="overflow-x-auto">
          {leaderboard.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Trophy className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No submissions graded yet</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Submissions will appear here once judges or organizers cast their scores.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-xs border-b border-outline-variant">
                  <th className="p-4 pl-6 text-center w-28">Rank</th>
                  <th className="p-4">Project Title</th>
                  <th className="p-4">Team</th>
                  <th className="p-4 text-center">Grades Cast</th>
                  <th className="p-4 text-center">Average Score</th>
                  <th className="p-4 text-right pr-6">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {leaderboard.map((entry, index) => {
                  const avgScore = entry.voteCount > 0 
                    ? (entry.totalScore / entry.voteCount).toFixed(1) 
                    : "0.0";
                  return (
                    <tr 
                      key={entry.id} 
                      className={`hover:bg-surface-container-low/30 transition-colors ${
                        index < 3 ? "bg-primary-container/1" : ""
                      }`}
                    >
                      <td className="p-4 pl-6 text-center">
                        {getPlacementBadge(index)}
                      </td>
                      <td className="p-4 font-semibold text-on-surface text-sm">
                        {entry.title}
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-outline" />
                          {entry.team.name}
                        </span>
                      </td>
                      <td className="p-4 text-center text-xs text-on-surface-variant font-mono">
                        <span className="flex items-center justify-center gap-1 font-semibold">
                          <MessageSquare className="h-3.5 w-3.5 text-outline" /> {entry.voteCount}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary font-mono bg-primary-container/10 px-2 py-0.5 rounded-lg border border-primary-container/20">
                          <Star className="h-3.5 w-3.5 text-primary fill-primary" />
                          {avgScore}
                        </span>
                      </td>
                      <td className="p-4 text-right pr-6 text-sm font-bold text-on-surface font-mono">
                        {entry.totalScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
