"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Trophy, 
  Users, 
  Layers, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Calendar, 
  AlertCircle,
  Megaphone,
  Ticket,
  Award,
  FileText,
  LayoutGrid
} from "lucide-react";
import { api } from "@/src/lib/api";

interface HackathonWithStats {
  id: string;
  name: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  authorId: string;
  submissionsCount: number;
  _count: {
    participants: number;
    teams: number;
  };
}

interface DashboardClientProps {
  initialHackathons: HackathonWithStats[];
  user: any;
}

export default function DashboardClient({ initialHackathons, user }: DashboardClientProps) {
  const [hackathons, setHackathons] = useState<HackathonWithStats[]>(initialHackathons);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Compute stat totals
  const totalHackathons = hackathons.length;
  const activeHackathons = hackathons.filter(h => h.isActive).length;
  const totalParticipants = hackathons.reduce((sum, h) => sum + (h._count?.participants || 0), 0);
  const totalSubmissions = hackathons.reduce((sum, h) => sum + (h.submissionsCount || 0), 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hackathon? This action is permanent and will delete all associated data.")) {
      return;
    }
    
    setDeletingId(id);
    setError(null);

    try {
      await api(`/hackathon/${id}`, {
        method: "DELETE",
      });
      // Instant UI update
      setHackathons(hackathons.filter(h => h.id !== id));
    } catch (err: any) {
      console.error("Delete hackathon failed:", err);
      setError(err?.message || "Failed to delete hackathon. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredHackathons = hackathons.filter(h => 
    h.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 font-body">
      {/* Welcome & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-on-surface tracking-tight">
            Organizer Console
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Welcome back, <strong className="text-on-surface">{user.name}</strong>. Manage your events and review submissions.
          </p>
        </div>
        <Link
          href="/organizer/hackathons/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-container text-on-primary text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-sm self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          New Hackathon
        </Link>
      </div>

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-outline transition-colors">
          <div className="w-12 h-12 rounded-xl bg-primary-container/10 text-primary flex items-center justify-center">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Hackathons</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalHackathons}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-outline transition-colors">
          <div className="w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Active Events</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{activeHackathons}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-outline transition-colors">
          <div className="w-12 h-12 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Participants</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalParticipants}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:border-outline transition-colors">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/30 text-secondary flex items-center justify-center">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Submissions</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{totalSubmissions}</p>
          </div>
        </div>
      </div>

      {/* Main Hackathon List Panel */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {/* Table Search Header */}
        <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
          <h2 className="font-display font-bold text-lg text-on-surface self-start sm:self-auto">
            Your Hackathons
          </h2>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-outline"
            />
          </div>
        </div>

        {/* Hackathons Table */}
        <div className="overflow-x-auto">
          {filteredHackathons.length === 0 ? (
            <div className="text-center py-12 px-4">
              <Trophy className="h-12 w-12 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-base">No hackathons found</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                {searchTerm ? "Try broadening your search query." : "Click 'New Hackathon' to create your first event."}
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-semibold text-xs border-b border-outline-variant">
                  <th className="p-4 pl-6">Hackathon Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Starts At</th>
                  <th className="p-4">Ends At</th>
                  <th className="p-4 text-center">Participants</th>
                  <th className="p-4 text-center">Teams</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredHackathons.map((h) => (
                  <tr key={h.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="font-semibold text-on-surface text-sm">{h.name}</div>
                      <div className="text-xs text-on-surface-variant max-w-[200px] truncate">{h.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                        h.isActive 
                          ? "bg-status-success/10 text-status-success"
                          : "bg-on-surface-variant/10 text-on-surface-variant"
                      }`}>
                        {h.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-on-surface-variant">
                      {new Date(h.startsAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-xs font-mono text-on-surface-variant">
                      {new Date(h.endsAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-on-surface">
                      {h._count?.participants || 0}
                    </td>
                    <td className="p-4 text-center text-sm font-semibold text-on-surface">
                      {h._count?.teams || 0}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {/* Edit Action */}
                        <Link
                          href={`/organizer/hackathons/${h.id}/edit`}
                          title="Edit Settings"
                          className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Link>
                        
                        {/* Delete Action */}
                        <button
                          onClick={() => handleDelete(h.id)}
                          disabled={deletingId === h.id}
                          title="Delete Hackathon"
                          className="p-1.5 text-on-surface-variant hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Hub Navigation Panels for Each Hackathon */}
      {filteredHackathons.length > 0 && (
        <div className="space-y-6">
          <h2 className="font-display font-bold text-xl text-on-surface tracking-tight">
            Hackathon Management Hubs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredHackathons.map((h) => (
              <div key={h.id} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-start border-b border-outline-variant/60 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-on-surface">{h.name}</h3>
                    <p className="text-xs text-on-surface-variant">Hub Actions</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    h.isActive ? "bg-status-success/10 text-status-success" : "bg-on-surface-variant/10"
                  }`}>
                    {h.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                
                {/* Management Links */}
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <Link
                    href={`/organizer/hackathons/${h.id}/applications`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Applications
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/teams`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Teams
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/events`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    Events & Schedule
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/announcements`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <Megaphone className="h-3.5 w-3.5" />
                    Announcements
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/tickets`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <Ticket className="h-3.5 w-3.5" />
                    Support Tickets
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/submissions`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Submissions
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/results`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all col-span-2 sm:col-span-1"
                  >
                    <Trophy className="h-3.5 w-3.5" />
                    Leaderboard / Results
                  </Link>
                  <Link
                    href={`/organizer/hackathons/${h.id}/certificates`}
                    className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-outline-variant/60 hover:border-primary hover:text-primary transition-all col-span-2 sm:col-span-1"
                  >
                    <Award className="h-3.5 w-3.5" />
                    Certificates
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
