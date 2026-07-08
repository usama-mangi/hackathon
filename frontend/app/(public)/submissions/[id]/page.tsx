import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import VotingPanel from "@/src/components/layouts/VotingPanel";
import { Code, Users, Play, ChevronRight, Tags } from "lucide-react";

export const dynamic = "force-dynamic";

interface SubmissionDetail {
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
    members?: Array<{
      id: string;
      userId: string;
      user: {
        id: string;
        name: string;
        image: string | null;
      };
    }>;
  };
  votes: Array<{
    id: string;
    submissionId: string;
    userId: string;
    score: number | null;
  }>;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  let submission: SubmissionDetail | null = null;

  try {
    submission = await api(`/submission/${id}`);
  } catch (err) {
    console.error("Failed to load submission detail:", err);
    notFound();
  }

  if (!submission) {
    notFound();
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

  const tags = getProjectTags(submission.title, submission.description);
  const teamMembers = submission.team.members || [];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-grow flex flex-col">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6 font-medium">
        <Link href="/hackathons" className="hover:text-primary transition-colors">
          Hackathons
        </Link>
        <ChevronRight className="h-3 w-3 text-outline" />
        <Link href={`/hackathons/${submission.team.hackathonId}`} className="hover:text-primary transition-colors">
          Event Hub
        </Link>
        <ChevronRight className="h-3 w-3 text-outline" />
        <Link href={`/hackathons/${submission.team.hackathonId}/submissions`} className="hover:text-primary transition-colors">
          Submissions
        </Link>
        <ChevronRight className="h-3 w-3 text-outline" />
        <span className="text-on-surface font-semibold truncate">{submission.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (70%) - Project Details */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight leading-tight">
                {submission.title}
              </h1>
              <span className="bg-surface-variant text-on-surface-variant text-xs px-2.5 py-0.5 rounded border border-outline-variant font-mono flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-outline" />
                {submission.team.name}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-container-highest text-on-surface px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Video Player / Thumbnail placeholder */}
          <div className="aspect-video w-full bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden border border-outline-variant group shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1024&auto=format&fit=crop"
              alt="Project demo placeholder screenshot"
              className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            
            <button className="w-16 h-16 bg-primary text-on-primary rounded-full flex items-center justify-center z-10 hover:bg-primary-container hover:scale-105 transition-all shadow-lg">
              <Play className="h-6 w-6 fill-current" />
            </button>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/80 z-10">
              Demo Walkthrough (3:00)
            </div>
          </div>

          {/* Project Description */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-on-surface mb-3">Project Overview</h2>
            <div className="text-sm text-on-surface-variant leading-relaxed space-y-4 whitespace-pre-line">
              {submission.description}
            </div>

            {/* Resource Links */}
            <div className="flex gap-4 mt-6 pt-6 border-t border-outline-variant/60">
              {submission.repoUrl && (
                <a
                  href={submission.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:text-primary hover:border-primary-container font-semibold transition-all text-xs"
                >
                  <Code className="h-4 w-4" />
                  GitHub Repository
                </a>
              )}
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-opacity-95 transition-all shadow-sm font-semibold text-xs"
                >
                  <span className="material-symbols-outlined text-base">open_in_new</span>
                  Live Demo
                </a>
              )}
            </div>
          </div>

          {/* Team Members List */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <h2 className="font-display font-bold text-lg text-on-surface mb-4">Team Members</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {teamMembers.length === 0 ? (
                <p className="text-xs text-on-surface-variant col-span-full">No members found.</p>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex flex-col items-center gap-2 p-2 border border-outline-variant/40 rounded-lg bg-surface-container-low/30">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name}
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary font-bold flex items-center justify-center border border-primary-container/20 text-sm">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-xs font-semibold text-on-surface text-center truncate w-full">
                      {member.user.name}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column (30%) - Judging Breakdown Panel */}
        <div className="lg:col-span-4">
          <VotingPanel
            submissionId={submission.id}
            hackathonId={submission.team.hackathonId}
            initialVotes={submission.votes}
          />
        </div>
      </div>
    </div>
  );
}
