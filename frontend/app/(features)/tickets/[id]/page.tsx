import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import TicketDetailClient from "./components/TicketDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage({ params }: PageProps) {
  const { id } = await params;
  let ticket = null;

  try {
    ticket = await api(`/tickets/${id}`);
  } catch (error) {
    console.error(`Failed to load ticket ${id}:`, error);
    notFound();
  }

  if (!ticket) {
    notFound();
  }

  return (
    <div className="w-full">
      <TicketDetailClient ticket={ticket} />
    </div>
  );
}
