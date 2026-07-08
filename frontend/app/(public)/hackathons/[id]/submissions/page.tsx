import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import { ArrowRight, Code, Group, Layers, Link2, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

interface SubmissionItem {
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
    hackathonId: string;
  };
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonSubmissionsPage({ params }: PageProps) {
  const { id } = await params;
  let submissions: SubmissionItem[] = [];
  let error: string | null = null;

  try {
    submissions = await api(`/hackathon/${id}/submissions`);
  } catch (err: any) {
    console.error("Failed to load submissions:", err);
    error = err?.message || "Could not retrieve submissions.";
  }

  // Helper to generate mock project tags for aesthetics (e.g. AI, Climate, Web3)
  const getProjectTags = (title: string, desc: string) => {
    const text = (title + " " + desc).toLowerCase();
    const tags = [];
    if (text.includes("climate") || text.includes("eco") || text.includes("green") || text.includes("earth")) tags.push("CLIMATE TECH");
    if (text.includes("ai") || text.includes("intelligence") || text.includes("neural") || text.includes("model") || text.includes("learn")) tags.push("MACHINE LEARNING");
    if (text.includes("chain") || text.includes("block") || text.includes("web3") || text.includes("contract")) tags.push("WEB3");
    if (text.includes("health") || text.includes("med") || text.includes("care") || text.includes("doctor")) tags.push("HEALTH TECH");
    if (tags.length === 0) tags.push("SOFTWARE");
    return tags;
  };

  return (
    <div className="space-y-6 py-4 flex-grow flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-display font-bold text-xl text-on-surface">Submissions</h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Explore final projects built by teams during the hackathon.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!error && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low flex-grow">
          <Layers className="w-12 h-12 text-outline mb-4" />
          <h3 className="font-display font-semibold text-lg text-on-surface">No Submissions Yet</h3>
          <p className="text-sm text-on-surface-variant mt-1">Teams have not submitted any projects for this event yet.</p>
        </div>
      )}

      {submissions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((sub) => {
            const tags = getProjectTags(sub.title, sub.description);
            return (
              <div
                key={sub.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between h-[280px] shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-display font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                      {sub.title}
                    </h3>
                  </div>

                  {/* Team credit badge */}
                  <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-3 font-mono">
                    <Group className="h-3.5 w-3.5 text-outline" />
                    <span>Team: {sub.team.name}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-surface-container-highest text-on-surface px-2 py-0.5 rounded text-[9px] font-bold tracking-wider font-sans"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-3 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="mt-6 flex justify-between items-center pt-4 border-t border-outline-variant/60">
                  <div className="flex gap-3">
                    {sub.repoUrl && (
                      <a
                        href={sub.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="GitHub Repository"
                      >
                        <Code className="h-4 w-4" />
                      </a>
                    )}
                    {sub.demoUrl && (
                      <a
                        href={sub.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="Live Demo"
                      >
                        <Link2 className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/submissions/${sub.id}`}
                    className="text-xs font-semibold text-primary hover:text-primary-container flex items-center gap-1"
                  >
                    View Project
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
