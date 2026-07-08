"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { api } from "@/src/lib/api";

interface JoinButtonProps {
  hackathonId: string;
}

export default function JoinHackathonButton({ hackathonId }: JoinButtonProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isPending) return;

    if (!session) {
      // User is anonymous, redirect to sign-in with current path as callback
      router.push(`/sign-in?callbackUrl=/hackathons/${hackathonId}`);
      return;
    }

    setJoining(true);
    setError(null);

    try {
      await api(`/hackathon/${hackathonId}/join`, {
        method: "POST",
      });
      setJoined(true);
      
      // Briefly show joined state, then reload or redirect to their team page
      setTimeout(() => {
        router.push(`/dashboard`);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to join hackathon:", err);
      // If they already joined, treat as successful or display a status
      if (err?.message?.includes("already joined")) {
        setJoined(true);
      } else {
        setError(err?.message || "Failed to join event.");
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setJoining(false);
    }
  };

  if (joined) {
    return (
      <button
        disabled
        className="text-xs font-bold bg-status-success text-white px-3.5 py-2 rounded-lg cursor-default border border-status-success flex items-center gap-1.5 animate-fade-in"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
        Joined
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleJoin}
        disabled={joining}
        className={`text-xs font-bold bg-primary-container text-on-primary px-3.5 py-2 rounded-lg hover:bg-opacity-95 transition-all shadow-sm ${
          joining ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {joining ? "Joining..." : "Join"}
      </button>
      
      {error && (
        <span className="absolute bottom-full right-0 mb-1 whitespace-nowrap bg-status-error text-white text-[10px] font-semibold py-1 px-2 rounded shadow z-10">
          {error}
        </span>
      )}
    </div>
  );
}
