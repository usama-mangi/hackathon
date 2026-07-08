import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import AnnouncementsClient from "./components/AnnouncementsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AnnouncementsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let announcements = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    announcements = await api(`/hackathon/${id}/announcements`);
  } catch (error) {
    console.error(`Failed to load announcements for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <AnnouncementsClient hackathon={hackathon} initialAnnouncements={announcements} />
    </div>
  );
}
