import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import TicketsClient from "./components/TicketsClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon = null;
  let tickets = [];

  try {
    hackathon = await api(`/hackathon/${id}`);
    tickets = await api(`/hackathon/${id}/tickets`);
  } catch (error) {
    console.error(`Failed to load tickets for hackathon ${id}:`, error);
    notFound();
  }

  if (!hackathon) {
    notFound();
  }

  return (
    <div className="w-full">
      <TicketsClient hackathon={hackathon} initialTickets={tickets} />
    </div>
  );
}
