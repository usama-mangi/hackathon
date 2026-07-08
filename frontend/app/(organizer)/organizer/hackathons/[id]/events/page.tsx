import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import EventsClient from "./components/EventsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EventsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let events = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    events = await api(`/hackathon/${id}/events`);
  } catch (error) {
    console.error(`Failed to load events for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <EventsClient hackathon={hackathon} initialEvents={events} />
    </div>
  );
}
