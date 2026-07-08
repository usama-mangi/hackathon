import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import TeamsClient from "./components/TeamsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let teams = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    teams = await api(`/hackathon/${id}/teams`);
  } catch (error) {
    console.error(`Failed to load teams for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <TeamsClient hackathon={hackathon} initialTeams={teams} />
    </div>
  );
}
