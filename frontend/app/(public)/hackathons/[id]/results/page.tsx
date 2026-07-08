import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import { Trophy, Award, ExternalLink, Download } from "lucide-react";

export const dynamic = "force-dynamic";

interface LeaderboardItem {
  id: string;
  teamId: string;
  title: string;
  description: string;
  repoUrl: string | null;
  demoUrl: string | null;
  videoUrl: string | null;
  team: {
    id: string;
    name: string;
  };
  totalScore: number;
  voteCount: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonResultsPage({ params }: PageProps) {
  const { id } = await params;
  let leaderboard: LeaderboardItem[] = [];
  let error: string | null = null;

  try {
    leaderboard = await api(`/hackathon/${id}/results`);
  } catch (err: any) {
    console.error("Failed to load results:", err);
    error = err?.message || "Could not retrieve results.";
  }

  // Calculate average score for each team
  const getAverageScore = (item: LeaderboardItem) => {
    if (item.voteCount === 0) return 0;
    // Round to 1 decimal place
    return Math.round((item.totalScore / item.voteCount) * 10) / 10;
  };

  // We need top 3 for the podium
  const firstPlace = leaderboard[0] || null;
  const secondPlace = leaderboard[1] || null;
  const thirdPlace = leaderboard[2] || null;
  const remaining = leaderboard.slice(3);

  return (
    <div className="space-y-12 py-4 flex-grow flex flex-col">
      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!error && leaderboard.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low flex-grow">
          <Trophy className="w-12 h-12 text-outline mb-4" />
          <h3 className="font-display font-semibold text-lg text-on-surface">Results Pending</h3>
          <p className="text-sm text-on-surface-variant mt-1">
            Submissions are currently being evaluated by judges. Check back soon for results!
          </p>
        </div>
      )}

      {leaderboard.length > 0 && (
        <>
          {/* Visual Podium Section */}
          <section className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-6 md:p-10">
            <h2 className="font-display font-bold text-xl text-on-surface mb-8 text-center">Top Innovators</h2>
            
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 h-auto md:h-[360px] max-w-4xl mx-auto">
              
              {/* 2nd Place (Silver - Left) */}
              {secondPlace ? (
                <div className="w-full md:w-1/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center shadow-sm order-2 md:order-1 transform md:translate-y-8 h-[240px] md:h-[280px] justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-slate-200 border-4 border-slate-300 flex items-center justify-center mb-3 relative">
                      <Award className="text-slate-600 h-6 w-6" />
                      <div className="absolute -bottom-2 bg-slate-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-700">
                        2ND
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-on-surface text-center line-clamp-1">
                      {secondPlace.team.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant text-center mt-0.5 line-clamp-1">
                      {secondPlace.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full mt-4">
                    <div className="font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-3 py-1 rounded-md">
                      {getAverageScore(secondPlace)} / 10
                    </div>
                    <Link
                      href={`/submissions/${secondPlace.id}`}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block w-1/3 h-[240px]" />
              )}

              {/* 1st Place (Gold - Center) */}
              {firstPlace ? (
                <div className="w-full md:w-1/3 bg-surface-container-lowest border-2 border-status-warning rounded-xl p-6 flex flex-col items-center shadow-[0_10px_25px_-5px_rgba(245,158,11,0.15)] order-1 md:order-2 relative z-10 h-[280px] md:h-[320px] justify-between">
                  <div className="absolute top-0 w-full h-1.5 bg-status-warning rounded-t-lg -mt-[2px] left-0" />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-amber-100 border-4 border-status-warning flex items-center justify-center mb-3 relative">
                      <Trophy className="text-status-warning h-8 w-8" />
                      <div className="absolute -bottom-2 bg-status-warning text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-600">
                        1ST PLACE
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-lg text-on-surface text-center line-clamp-1">
                      {firstPlace.team.name}
                    </h3>
                    <p className="text-xs font-semibold text-secondary text-center mt-0.5 line-clamp-1">
                      {firstPlace.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full mt-4">
                    <div className="font-mono text-base font-bold text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1 rounded-md">
                      {getAverageScore(firstPlace)} / 10
                    </div>
                    <Link
                      href={`/submissions/${firstPlace.id}`}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block w-1/3 h-[280px]" />
              )}

              {/* 3rd Place (Bronze - Right) */}
              {thirdPlace ? (
                <div className="w-full md:w-1/3 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center shadow-sm order-3 transform md:translate-y-12 h-[220px] md:h-[260px] justify-between">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 rounded-full bg-orange-100 border-4 border-orange-300 flex items-center justify-center mb-3 relative">
                      <Award className="text-orange-600 h-6 w-6" />
                      <div className="absolute -bottom-2 bg-orange-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-700">
                        3RD
                      </div>
                    </div>
                    <h3 className="font-display font-bold text-base text-on-surface text-center line-clamp-1">
                      {thirdPlace.team.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant text-center mt-0.5 line-clamp-1">
                      {thirdPlace.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2 w-full mt-4">
                    <div className="font-mono text-sm font-semibold text-orange-800 bg-orange-50 px-3 py-1 rounded-md">
                      {getAverageScore(thirdPlace)} / 10
                    </div>
                    <Link
                      href={`/submissions/${thirdPlace.id}`}
                      className="text-[11px] font-semibold text-primary hover:underline"
                    >
                      View project
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="hidden md:block w-1/3 h-[220px]" />
              )}

            </div>
          </section>

          {/* Full Leaderboard Table (Ranks 4+) */}
          {remaining.length > 0 && (
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-display font-bold text-lg text-on-surface">Leaderboard (Ranks 4+)</h2>
                <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                  Export CSV <Download className="h-3 w-3" />
                </button>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant text-[11px] font-bold font-mono tracking-wider text-secondary">
                        <th className="p-4 w-20">Rank</th>
                        <th className="p-4">Team</th>
                        <th className="p-4">Project</th>
                        <th className="p-4">Average Score</th>
                        <th className="p-4 w-24">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {remaining.map((item, idx) => {
                        const rank = idx + 4;
                        const avg = getAverageScore(item);
                        return (
                          <tr
                            key={item.id}
                            className="border-b last:border-0 border-outline-variant hover:bg-surface-container-low/40 transition-colors"
                          >
                            <td className="p-4 font-mono font-semibold text-on-surface">
                              {rank < 10 ? `0${rank}` : rank}
                            </td>
                            <td className="p-4 text-sm font-semibold text-on-surface">
                              {item.team.name}
                            </td>
                            <td className="p-4 text-xs text-on-surface-variant">
                              {item.title}
                            </td>
                            <td className="p-4 font-mono text-sm text-primary font-bold">
                              {avg} / 10
                            </td>
                            <td className="p-4">
                              <Link
                                href={`/submissions/${item.id}`}
                                className="text-on-surface-variant hover:text-primary transition-colors inline-block"
                                title="Open Submission"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
