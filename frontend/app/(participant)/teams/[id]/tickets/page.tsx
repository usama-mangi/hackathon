"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { z } from "zod";
import {
  HelpCircle,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronLeft,
  Send,
  Ticket,
} from "lucide-react";

type TicketStatus = "OPEN" | "CLAIMED" | "RESOLVED";

const ticketStatusConfig: Record<TicketStatus, { cls: string; dot: string }> = {
  OPEN: { cls: "bg-status-warning/15 text-status-warning", dot: "bg-status-warning" },
  CLAIMED: { cls: "bg-primary-container/15 text-primary", dot: "bg-primary-container" },
  RESOLVED: { cls: "bg-status-success/15 text-status-success", dot: "bg-status-success" },
};

const schema = z.object({
  issue: z.string().min(10, "Issue description must be at least 10 characters").max(1000, "Too long (max 1000)"),
});

export default function TicketsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [issue, setIssue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) loadTickets();
  }, [session, isPending]);

  async function loadTickets() {
    try {
      const team = await api(`/teams/${params.id}`);
      setTickets(team?.tickets || []);
    } catch {
      // swallow — page still usable
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ issue });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const ticket = await api(`/teams/${params.id}/tickets`, {
        method: "POST",
        body: JSON.stringify({ issue }),
      });
      setTickets((prev) => [ticket, ...prev]);
      setIssue("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setServerError(err.message || "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
        <button onClick={() => router.back()} className="hover:text-primary transition-colors flex items-center gap-1">
          <ChevronLeft className="h-3.5 w-3.5" />
          Back to Team
        </button>
        <span>/</span>
        <span>Support Tickets</span>
      </div>

      <div className="mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-container/10 border border-primary-container/20 flex items-center justify-center mb-4">
          <HelpCircle className="h-6 w-6 text-primary" />
        </div>
        <h1 className="font-display font-bold text-2xl text-on-surface mb-1">Request Support</h1>
        <p className="text-sm text-on-surface-variant">
          Submit a help request and a mentor or organizer will assist you.
        </p>
      </div>

      {/* Ticket form */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {serverError}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-status-success/10 border border-status-success/20 text-status-success text-sm">
              <CheckCircle className="h-4 w-4 shrink-0" />
              Ticket submitted! A mentor will reach out soon.
            </div>
          )}

          <div>
            <label htmlFor="ticket-issue" className="block text-sm font-medium text-on-surface mb-1.5">
              Describe your issue <span className="text-status-error">*</span>
            </label>
            <textarea
              id="ticket-issue"
              rows={5}
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="e.g. We need help understanding how to use the API for authentication. We've tried X but keep getting Y error…"
              maxLength={1000}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-on-surface bg-surface-container-lowest placeholder:text-outline resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 transition ${
                error ? "border-status-error" : "border-outline-variant focus:border-primary/50"
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              {error ? (
                <p className="text-xs text-status-error flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {error}
                </p>
              ) : <span />}
              <span className="text-[10px] font-mono text-outline ml-auto">{issue.length}/1000</span>
            </div>
          </div>

          <button
            id="submit-ticket-btn"
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit Ticket
          </button>
        </form>
      </div>

      {/* Existing tickets */}
      <div>
        <h2 className="font-display font-semibold text-on-surface mb-4 flex items-center gap-2">
          <Ticket className="h-4 w-4 text-outline" />
          Your Tickets
          <span className="text-xs font-mono text-on-surface-variant ml-1">({tickets.length})</span>
        </h2>

        {tickets.length === 0 ? (
          <div className="flex flex-col items-center text-center py-10 gap-3 rounded-2xl border border-dashed border-outline-variant">
            <Ticket className="h-10 w-10 text-outline" />
            <p className="text-sm text-on-surface-variant">No tickets yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket: any) => {
              const cfg = ticketStatusConfig[ticket.status as TicketStatus] || ticketStatusConfig.OPEN;
              return (
                <div
                  key={ticket.id}
                  className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 flex flex-col gap-3 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-on-surface leading-relaxed flex-1">{ticket.issue}</p>
                    <span className={`shrink-0 flex items-center gap-1.5 text-[10px] font-bold font-mono px-2.5 py-1 rounded-full ${cfg.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {ticket.status}
                    </span>
                  </div>
                  {ticket.createdAt && (
                    <p className="text-[10px] font-mono text-outline">
                      {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
