import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import EditHackathonClient from "./components/EditHackathonClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditHackathonPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;

  try {
    hackathon = await api(`/hackathon/${id}`);
  } catch (error) {
    console.error(`Failed to fetch hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <EditHackathonClient hackathon={hackathon} />
    </div>
  );
}
