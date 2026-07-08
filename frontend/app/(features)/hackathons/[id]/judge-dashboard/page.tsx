import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import JudgeDashboardClient from "./components/JudgeDashboardClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgeDashboardPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let submissions = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    submissions = await api(`/hackathon/${id}/submissions`);
  } catch (error) {
    console.error(`Failed to load judge dashboard for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <JudgeDashboardClient
        hackathon={hackathon}
        initialSubmissions={submissions ?? []}
      />
    </div>
  );
}
