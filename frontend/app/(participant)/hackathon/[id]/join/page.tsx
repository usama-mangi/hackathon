"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import {
  Trophy,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  CalendarDays,
  Clock,
  LogIn,
} from "lucide-react";

export default function JoinHackathonPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [hackathon, setHackathon] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userRole = (session?.user as any)?.role;
  const isParticipant = !userRole || userRole === "PARTICIPANT";

  useEffect(() => {
    if (!session && !isPending) {
      router.push(`/sign-in?redirect=/hackathon/${params.id}/join`);
      return;
    }
    loadHackathon();
  }, [session, isPending]);

  async function loadHackathon() {
    try {
      const data = await api(`/hackathon/${params.id}`);
      setHackathon(data);
    } catch (err: any) {
      setError(err.message || "Hackathon not found");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      await api(`/hackathon/${params.id}/join`, { method: "POST" });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch (err: any) {
      setError(err.message || "Failed to join hackathon");
    } finally {
      setJoining(false);
    }
  }

  const getStatus = (h: any) => {
    if (!h?.isActive) return { label: "COMPLETED", cls: "bg-outline/10 text-secondary" };
    const now = new Date();
    if (now >= new Date(h.startsAt) && now <= new Date(h.endsAt))
      return { label: "LIVE", cls: "bg-status-success/15 text-status-success" };
    if (now < new Date(h.startsAt))
      return { label: "UPCOMING", cls: "bg-status-warning/15 text-status-warning" };
    return { label: "COMPLETED", cls: "bg-outline/10 text-secondary" };
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const status = hackathon ? getStatus(hackathon) : null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
          {/* Header bar */}
          <div className="bg-slate-900 px-6 pt-8 pb-6 flex flex-col gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
              <Trophy className="h-6 w-6 text-on-primary" />
            </div>
            {hackathon && (
              <>
                <div className="flex items-start gap-2">
                  <h1 className="font-display font-bold text-xl text-white leading-snug">
                    {hackathon.name}
                  </h1>
                  {status && (
                    <span className={`shrink-0 mt-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${status.cls}`}>
                      {status.label}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-xs text-slate-300 font-mono">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                    Starts {new Date(hackathon.startsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    Ends {new Date(hackathon.endsAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </>
            )}
            {!hackathon && error && (
              <p className="text-white font-display font-bold text-lg">Hackathon Not Found</p>
            )}
          </div>

          {/* Body */}
          <div className="px-6 py-6 flex flex-col gap-5">
            {/* RBAC notice */}
            {!isParticipant && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-status-warning/10 border border-status-warning/20">
                <AlertCircle className="h-4 w-4 text-status-warning mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-on-surface">Wrong Role</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Only <span className="font-mono font-bold">PARTICIPANT</span> accounts can join a hackathon as a hacker. Your current role is{" "}
                    <span className="font-mono font-bold">{userRole}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {success ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <CheckCircle className="h-12 w-12 text-status-success" />
                <p className="font-display font-bold text-on-surface text-lg">You&apos;re in!</p>
                <p className="text-sm text-on-surface-variant">
                  Redirecting to your dashboard…
                </p>
              </div>
            ) : (
              <>
                {hackathon && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-surface-container border border-outline-variant">
                    <Users className="h-4 w-4 text-outline mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-on-surface">Joining as Participant</p>
                      <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                        You&apos;ll be registered as a participant in{" "}
                        <span className="font-semibold text-on-surface">{hackathon.name}</span>. After joining you can create or join a team and start hacking.
                      </p>
                    </div>
                  </div>
                )}

                <button
                  id="join-hackathon-btn"
                  onClick={handleJoin}
                  disabled={joining || !hackathon || !isParticipant}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary-container text-on-primary font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {joining ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Join Hackathon
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-on-surface-variant mt-4">
          Want to apply as a Mentor or Judge instead?{" "}
          <a
            href={hackathon ? `/hackathons/${hackathon.id}/apply` : "#"}
            className="text-primary font-semibold hover:underline"
          >
            Apply here
          </a>
        </p>
      </div>
    </div>
  );
}
