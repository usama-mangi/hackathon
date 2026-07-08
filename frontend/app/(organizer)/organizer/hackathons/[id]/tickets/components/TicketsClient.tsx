"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Search, 
  Ticket, 
  CheckCircle, 
  User, 
  Clock, 
  AlertCircle, 
  HelpCircle, 
  Wrench,
  Check
} from "lucide-react";
import { api } from "@/src/lib/api";

interface TicketItem {
  id: string;
  hackathonId: string;
  teamId: string;
  issue: string;
  status: "OPEN" | "CLAIMED" | "RESOLVED";
  mentorId: string | null;
  createdAt: string;
  updatedAt: string;
  team: {
    id: string;
    name: string;
  };
  mentor: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface TicketsClientProps {
  hackathon: any;
  initialTickets: TicketItem[];
}

export default function TicketsClient({ hackathon, initialTickets }: TicketsClientProps) {
  const [tickets, setTickets] = useState<TicketItem[]>(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLAIMED" | "RESOLVED">("ALL");
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleClaim = async (ticketId: string) => {
    setSubmittingId(ticketId);
    setError(null);
    setSuccess(null);
    try {
      const response = await api(`/tickets/${ticketId}/claim`, {
        method: "PUT",
      });
      
      if (response) {
        // Update local ticket state
        setTickets(prev => prev.map(t => t.id === ticketId ? { 
          ...t, 
          status: "CLAIMED", 
          mentor: response.mentor || { name: "You", email: "" } 
        } : t));
        setSuccess("Ticket claimed successfully!");
      }
    } catch (err: any) {
      console.error("Claim ticket failed:", err);
      setError(err?.message || "Failed to claim ticket.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleResolve = async (ticketId: string) => {
    setSubmittingId(ticketId);
    setError(null);
    setSuccess(null);
    try {
      const response = await api(`/tickets/${ticketId}/resolve`, {
        method: "PUT",
      });
      
      if (response) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: "RESOLVED" } : t));
        setSuccess("Ticket marked as resolved!");
      }
    } catch (err: any) {
      console.error("Resolve ticket failed:", err);
      setError(err?.message || "Failed to resolve ticket.");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredTickets = tickets.filter(t => {
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesSearch = t.team.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (t.mentor?.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Count open tickets
  const openCount = tickets.filter(t => t.status === "OPEN").length;
  const claimedCount = tickets.filter(t => t.status === "CLAIMED").length;

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
            Support Desk & Tickets
          </h1>
          <p className="text-xs text-on-surface-variant">
            Track and resolve help requests submitted by teams inside <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-status-success/10 border border-status-success/20 text-status-success px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-status-error/10 text-status-error flex items-center justify-center">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Unclaimed Tickets</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{openCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-status-warning/10 text-status-warning flex items-center justify-center">
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Claimed / In-Progress</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{claimedCount}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Total Tickets</p>
            <p className="font-display text-2xl font-bold text-on-surface mt-1">{tickets.length}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-outline-variant/60 pb-3">
        <div className="flex bg-surface-container rounded-xl p-1 w-full sm:w-auto overflow-x-auto">
          {(["ALL", "OPEN", "CLAIMED", "RESOLVED"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-primary-container text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {status === "ALL" ? "All Tickets" : status}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
          <input
            type="text"
            placeholder="Search tickets, teams, mentors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-outline-variant rounded-xl bg-surface text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-outline"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant p-16 rounded-2xl text-center shadow-sm">
            <Ticket className="h-12 w-12 text-outline/50 mx-auto mb-3" />
            <h3 className="font-semibold text-on-surface text-sm">No tickets found</h3>
            <p className="text-xs text-on-surface-variant mt-1">
              There are no support tickets in this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((t) => (
              <div 
                key={t.id} 
                className={`bg-surface-container-lowest border rounded-2xl p-5 shadow-sm space-y-4 hover:border-outline transition-colors ${
                  t.status === "OPEN" 
                    ? "border-status-error/20 bg-status-error/5" 
                    : t.status === "CLAIMED"
                    ? "border-status-warning/20 bg-status-warning/5"
                    : "border-outline-variant"
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-on-surface">{t.team.name}</span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === "OPEN"
                        ? "bg-status-error/15 text-status-error"
                        : t.status === "CLAIMED"
                        ? "bg-status-warning/15 text-status-warning"
                        : "bg-status-success/15 text-status-success"
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-outline" />
                      {new Date(t.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed whitespace-pre-wrap bg-surface p-3.5 rounded-xl border border-outline-variant/40">
                  {t.issue}
                </p>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-outline-variant/40">
                  {/* Claiming Mentor */}
                  <div className="text-xs text-on-surface-variant flex items-center gap-1.5 font-semibold">
                    <User className="h-4 w-4 text-outline" />
                    {t.mentor ? (
                      <span>Claimed by: <strong className="text-on-surface">{t.mentor.name}</strong> ({t.mentor.email})</span>
                    ) : (
                      <span className="text-outline italic">No mentor assigned yet</span>
                    )}
                  </div>

                  {/* Actions */}
                  {t.status !== "RESOLVED" && (
                    <div className="flex gap-2 w-full sm:w-auto">
                      {t.status === "OPEN" && (
                        <button
                          onClick={() => handleClaim(t.id)}
                          disabled={submittingId === t.id}
                          className="px-4 py-1.5 bg-status-warning text-on-primary font-semibold rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-opacity w-full sm:w-auto shadow-sm"
                        >
                          {submittingId === t.id ? "Claiming..." : "Claim Ticket"}
                        </button>
                      )}
                      {t.status === "CLAIMED" && (
                        <button
                          onClick={() => handleResolve(t.id)}
                          disabled={submittingId === t.id}
                          className="px-4 py-1.5 bg-status-success text-on-primary font-semibold rounded-lg text-xs hover:opacity-90 disabled:opacity-50 transition-opacity w-full sm:w-auto shadow-sm"
                        >
                          {submittingId === t.id ? "Resolving..." : "Mark Resolved"}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
