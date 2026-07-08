"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Check, 
  X, 
  Users, 
  Clock, 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  AlertCircle 
} from "lucide-react";
import { api } from "@/src/lib/api";

interface Application {
  id: string;
  hackathonId: string;
  userId: string;
  roleType: string;
  status: string;
  bio: string;
  motivation: string;
  experience: string;
  skills: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  availability: string | null;
  expertiseArea: string | null;
  priorJudgingExp: string | null;
  conflictStatement: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ApplicationsClientProps {
  hackathon: any;
  initialApplications: Application[];
}

export default function ApplicationsClient({ hackathon, initialApplications }: ApplicationsClientProps) {
  const [applications, setApplications] = useState<Application[]>(initialApplications);
  const [activeTab, setActiveTab] = useState<"ALL" | "MENTOR" | "JUDGE">("ALL");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleAccept = async (app: Application) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await api(`/hackathon/${hackathon.id}/applications/${app.id}/accept`, {
        method: "PUT",
      });

      if (updated) {
        // Update local list state
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "ACCEPTED" } : a));
        // Update selected app state
        setSelectedApp(prev => prev && prev.id === app.id ? { ...prev, status: "ACCEPTED" } : prev);
      }
    } catch (err: any) {
      console.error("Accept application failed:", err);
      setActionError(err?.message || "Failed to accept application.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (app: Application) => {
    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await api(`/hackathon/${hackathon.id}/applications/${app.id}/reject`, {
        method: "PUT",
      });

      if (updated) {
        setApplications(prev => prev.map(a => a.id === app.id ? { ...a, status: "REJECTED" } : a));
        setSelectedApp(prev => prev && prev.id === app.id ? { ...prev, status: "REJECTED" } : prev);
      }
    } catch (err: any) {
      console.error("Reject application failed:", err);
      setActionError(err?.message || "Failed to reject application.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filter logic
  const filteredApps = applications.filter(app => {
    const matchesTab = activeTab === "ALL" || app.roleType === activeTab;
    const matchesSearch = app.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 font-body relative min-h-[80vh]">
      {/* Header & Back Link */}
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
            Role Applications
          </h1>
          <p className="text-xs text-on-surface-variant">
            Review Mentor and Judge applications for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/60 pb-3">
        <div className="flex bg-surface-container rounded-xl p-1 w-full sm:w-auto">
          {(["ALL", "MENTOR", "JUDGE"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab === "ALL" ? "All Roles" : tab + "S"}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-outline"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 px-4">
              <Users className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No applications found</h3>
              <p className="text-xs text-on-surface-variant mt-1">
                There are no pending or resolved applications matching this filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-xs border-b border-outline-variant">
                  <th className="p-4 pl-6">Applicant Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Requested Role</th>
                  <th className="p-4">Applied Date</th>
                  <th className="p-4 pr-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredApps.map((app) => (
                  <tr
                    key={app.id}
                    onClick={() => {
                      setSelectedApp(app);
                      setActionError(null);
                    }}
                    className={`hover:bg-surface-container-low/40 cursor-pointer transition-colors ${
                      selectedApp?.id === app.id ? "bg-primary-container/5" : ""
                    }`}
                  >
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-on-surface text-sm">{app.user.name}</div>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant font-mono">
                      {app.user.email}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${
                        app.roleType === "MENTOR"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-container/30 text-tertiary"
                      }`}>
                        {app.roleType}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-on-surface-variant flex items-center gap-1.5 pt-5">
                      <Clock className="h-3.5 w-3.5 text-outline" />
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        app.status === "ACCEPTED"
                          ? "bg-status-success/10 text-status-success"
                          : app.status === "REJECTED"
                          ? "bg-status-error/10 text-status-error"
                          : "bg-status-warning/10 text-status-warning"
                      }`}>
                        {app.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-out Drawer Backdrop */}
      {selectedApp && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity duration-300 md:pl-[260px]" 
          onClick={() => setSelectedApp(null)} 
        />
      )}

      {/* Slide-out Drawer (340px) */}
      <div className={`fixed top-0 right-0 h-full w-[340px] z-50 bg-surface-container-lowest border-l border-outline-variant shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
        selectedApp ? "translate-x-0" : "translate-x-full"
      }`}>
        {selectedApp && (
          <>
            {/* Drawer Header */}
            <div className="p-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <div>
                <h3 className="font-display font-bold text-sm text-on-surface">{selectedApp.user.name}</h3>
                <p className="text-[11px] text-on-surface-variant font-mono">{selectedApp.user.email}</p>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-on-surface-variant leading-relaxed">
              {/* Role Type & Status Badges */}
              <div className="flex justify-between items-center bg-surface p-3 rounded-xl border border-outline-variant/60">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                  selectedApp.roleType === "MENTOR" ? "bg-secondary-container text-on-secondary-container" : "bg-tertiary-container/30 text-tertiary"
                }`}>
                  {selectedApp.roleType} ROLE
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  selectedApp.status === "ACCEPTED"
                    ? "bg-status-success/10 text-status-success"
                    : selectedApp.status === "REJECTED"
                    ? "bg-status-error/10 text-status-error"
                    : "bg-status-warning/10 text-status-warning"
                }`}>
                  {selectedApp.status}
                </span>
              </div>

              {/* Bio & Links */}
              <div className="space-y-2">
                <h4 className="font-semibold text-on-surface flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-outline" /> Biography & Links
                </h4>
                <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40 italic">
                  "{selectedApp.bio}"
                </p>
                <div className="flex gap-3 pt-1.5">
                  {selectedApp.linkedinUrl && (
                    <a
                      href={selectedApp.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                  {selectedApp.githubUrl && (
                    <a
                      href={selectedApp.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-on-surface hover:underline"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              {/* Motivation */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-on-surface flex items-center gap-1.5">
                  <GraduationCap className="h-3.5 w-3.5 text-outline" /> Motivation
                </h4>
                <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40">{selectedApp.motivation}</p>
              </div>

              {/* Experience */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-on-surface flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-outline" /> Prior Experience
                </h4>
                <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40">{selectedApp.experience}</p>
              </div>

              {/* Role specific info */}
              {selectedApp.roleType === "MENTOR" ? (
                <>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-on-surface">Skills / Expertise</h4>
                    <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40 font-semibold text-on-surface">
                      {selectedApp.skills || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-on-surface">Weekly Availability</h4>
                    <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40">
                      {selectedApp.availability || "N/A"}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-on-surface">Expertise Area</h4>
                    <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40 font-semibold text-on-surface">
                      {selectedApp.expertiseArea || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-on-surface">Prior Judging Experience</h4>
                    <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40">
                      {selectedApp.priorJudgingExp || "N/A"}
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-semibold text-on-surface">Conflict of Interest Statement</h4>
                    <p className="bg-surface p-2.5 rounded-lg border border-outline-variant/40 italic">
                      {selectedApp.conflictStatement || "None declared"}
                    </p>
                  </div>
                </>
              )}

              {actionError && (
                <div className="bg-status-error/10 border border-status-error/20 text-status-error p-2.5 rounded-lg text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions (Sticky) */}
            {selectedApp.status === "PENDING" && (
              <div className="p-4 border-t border-outline-variant bg-surface-container-low flex gap-3">
                <button
                  onClick={() => handleReject(selectedApp)}
                  disabled={submitting}
                  className="flex-1 py-2 bg-status-error text-on-primary font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-[11px] flex items-center justify-center gap-1 shadow-sm"
                >
                  <X className="h-3.5 w-3.5" /> Reject
                </button>
                <button
                  onClick={() => handleAccept(selectedApp)}
                  disabled={submitting}
                  className="flex-1 py-2 bg-status-success text-on-primary font-semibold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 text-[11px] flex items-center justify-center gap-1 shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" /> Accept
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
