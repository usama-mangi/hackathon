"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Code, 
  Users, 
  Link2, 
  FileText, 
  ExternalLink,
  GitBranch,
  Video,
  Play,
  AlertCircle
} from "lucide-react";
import { api } from "@/src/lib/api";
import VotingPanel from "@/src/components/layouts/VotingPanel";
import VideoPlayer from "@/src/components/ui/VideoPlayer";

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

interface SubmissionsClientProps {
  hackathon: any;
  initialSubmissions: SubmissionListItem[];
}

export default function SubmissionsClient({ hackathon, initialSubmissions }: SubmissionsClientProps) {
  const [submissions] = useState<SubmissionListItem[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  
  const [selectedSub, setSelectedSub] = useState<SubmissionDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Fetch detailed submission (with votes and members) when a row is clicked
  useEffect(() => {
    if (!selectedSubId) {
      setSelectedSub(null);
      return;
    }

    const fetchDetail = async () => {
      setLoadingDetail(true);
      setDetailError(null);
      try {
        const data = await api(`/submission/${selectedSubId}`);
        setSelectedSub(data);
      } catch (err: any) {
        console.error("Failed to load submission details:", err);
        setDetailError(err?.message || "Failed to load submission details.");
      } finally {
        setLoadingDetail(false);
      }
    };

    fetchDetail();
  }, [selectedSubId]);

  const filteredSubmissions = submissions.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            Submissions Review
          </h1>
          <p className="text-xs text-on-surface-variant">
            Grade projects and review final code repositories for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 columns) - Search & Submissions list */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <input
              type="text"
              placeholder="Search by project or team name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface-container-lowest text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-outline"
            />
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h2 className="font-display font-semibold text-sm text-on-surface">Submissions ({filteredSubmissions.length})</h2>
            </div>
            
            <div className="divide-y divide-outline-variant/60 max-h-[60vh] overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <FileText className="h-10 w-10 text-outline/50 mx-auto mb-3" />
                  <p className="text-xs text-on-surface-variant">No submissions found</p>
                </div>
              ) : (
                filteredSubmissions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSubId(s.id)}
                    className={`w-full text-left p-4 hover:bg-surface-container transition-colors block ${
                      selectedSubId === s.id ? "bg-primary-container/5 border-l-2 border-primary" : ""
                    }`}
                  >
                    <span className="font-bold text-xs text-on-surface block truncate">{s.title}</span>
                    <span className="text-[11px] text-on-surface-variant block mt-1 font-semibold">Team: {s.team.name}</span>
                    <span className="text-[10px] text-outline font-mono block mt-0.5">Submitted: {new Date(s.createdAt).toLocaleDateString()}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (7 columns) - Project details & Grading Panel */}
        <div className="lg:col-span-7 space-y-6">
          {selectedSubId ? (
            loadingDetail ? (
              <div className="bg-surface-container-lowest border border-outline-variant p-12 rounded-2xl text-center space-y-4 animate-pulse">
                <div className="h-6 bg-surface-container w-1/3 mx-auto rounded" />
                <div className="h-20 bg-surface-container rounded-xl w-full" />
                <div className="h-40 bg-surface-container rounded-xl w-full" />
              </div>
            ) : detailError ? (
              <div className="bg-status-error/10 border border-status-error/20 text-status-error p-6 rounded-2xl flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{detailError}</span>
              </div>
            ) : selectedSub ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Details (8 columns on md) */}
                <div className="md:col-span-8 space-y-5">
                  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
                    <div>
                      <h2 className="font-display font-bold text-lg text-on-surface leading-snug">{selectedSub.title}</h2>
                      <p className="text-xs text-on-surface-variant font-semibold mt-1">Submitted by team: <strong className="text-on-surface">{selectedSub.team.name}</strong></p>
                    </div>

                    <div className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-surface p-4 rounded-xl border border-outline-variant/40">
                      {selectedSub.description}
                    </div>

                    {/* Resources & Repos */}
                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-bold text-on-surface">Resources</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                        {selectedSub.repoUrl ? (
                          <a
                            href={selectedSub.repoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                          >
                            <GitBranch className="h-4 w-4 text-outline" />
                            Repository Link
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container border border-outline-variant/35 text-outline">
                            <GitBranch className="h-4 w-4" />
                            No Repository
                          </div>
                        )}

                        {selectedSub.demoUrl ? (
                          <a
                            href={selectedSub.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                          >
                            <Link2 className="h-4 w-4 text-outline" />
                            Live Demo Link
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </a>
                        ) : (
                          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-container border border-outline-variant/35 text-outline">
                            <Link2 className="h-4 w-4" />
                            No Live Demo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Video Player */}
                  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="h-4 w-4 text-outline" /> Demo Video Presentation
                    </h3>
                    <VideoPlayer videoUrl={selectedSub.videoUrl} title={selectedSub.title} />
                  </div>
                </div>

                {/* Grading Panel (4 columns on md) */}
                <div className="md:col-span-4">
                  <VotingPanel
                    submissionId={selectedSub.id}
                    hackathonId={hackathon.id}
                    initialVotes={selectedSub.votes}
                  />
                </div>
              </div>
            ) : null
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant p-16 rounded-2xl text-center shadow-sm">
              <FileText className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">Select a project</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Choose a project submission from the list on the left to grade, review its code repository, and watch the demo presentation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
