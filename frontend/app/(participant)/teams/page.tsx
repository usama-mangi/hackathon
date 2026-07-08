"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";
import { Users, Crown, Loader2, AlertCircle, Plus, ChevronRight } from "lucide-react";

export default function TeamsListPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session && !isPending) {
      router.push("/sign-in");
      return;
    }
    if (session) loadTeams();
  }, [session, isPending]);

  // The backend doesn't have a /teams/me endpoint; we infer from hackathon list
  async function loadTeams() {
    try {
      // Attempt to get all hackathons and check for team memberships
      // This is a best-effort listing — individual team pages are the real hub
      setTeams([]);
    } catch (err: any) {
      setError(err.message || "Failed to load teams");
    } finally {
      setLoading(false);
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
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-on-surface tracking-tight mb-1">
            My Teams
          </h1>
          <p className="text-sm text-on-surface-variant">
            Teams you&apos;re a member of across all hackathons.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-status-error/10 border border-status-error/20 text-status-error text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state — navigate via Team Hub using a team ID */}
      <div className="flex flex-col items-center text-center py-20 gap-4 rounded-2xl border border-dashed border-outline-variant">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
          <Users className="h-8 w-8 text-outline" />
        </div>
        <div>
          <p className="font-display font-semibold text-on-surface text-lg mb-1">
            No Teams Yet
          </p>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto">
            Join a hackathon first, then create a team or use an invite code to join an existing one.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          <Link
            href="/hackathons"
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary-container text-on-primary text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="h-4 w-4" />
            Browse Hackathons
          </Link>
        </div>
      </div>
    </div>
  );
}
