import React from "react";
import { api } from "@/src/lib/api";
import { redirect } from "next/navigation";
import DashboardClient from "./components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function OrganizerDashboardPage() {
  let user = null;
  let allHackathons: any[] = [];
  
  try {
    const profile = await api("/me");
    if (profile && profile.user) {
      user = profile.user;
    }
  } catch (error) {
    console.error("Failed to fetch user in organizer page:", error);
  }

  if (!user) {
    redirect("/sign-in");
  }

  try {
    allHackathons = await api("/hackathon");
  } catch (error) {
    console.error("Failed to fetch hackathons in organizer page:", error);
  }

  // Filter hackathons owned by current user
  const ownedHackathons = allHackathons.filter(
    (h) => h.authorId === user.id
  );

  // Fetch submissions counts in parallel for owned hackathons
  const hackathonsWithSubmissions = await Promise.all(
    ownedHackathons.map(async (h) => {
      let submissionsCount = 0;
      try {
        const subs = await api(`/hackathon/${h.id}/submissions`);
        if (Array.isArray(subs)) {
          submissionsCount = subs.length;
        }
      } catch (err) {
        console.error(`Failed to fetch submissions for hackathon ${h.id}:`, err);
      }
      return {
        ...h,
        submissionsCount,
      };
    })
  );

  return (
    <div className="w-full">
      <DashboardClient initialHackathons={hackathonsWithSubmissions} user={user} />
    </div>
  );
}
