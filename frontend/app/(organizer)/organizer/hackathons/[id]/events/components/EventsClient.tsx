"use client";

import React, { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3, 
  Plus, 
  AlertCircle, 
  Clock, 
  Check 
} from "lucide-react";
import { api } from "@/src/lib/api";

interface EventItem {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
}

interface EventsClientProps {
  hackathon: any;
  initialEvents: EventItem[];
}

const formatDateForInput = (isoString: string) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const getTodayString = () => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const getLaterTodayString = () => {
  const d = new Date();
  d.setHours(10, 0, 0, 0);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
};

const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().or(z.literal("")),
  startsAt: z.string().min(1, "Start time is required"),
  endsAt: z.string().min(1, "End time is required"),
  location: z.string().optional().or(z.literal("")),
}).refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
  message: "End time must be after start time",
  path: ["endsAt"],
});

export default function EventsClient({ hackathon, initialEvents }: EventsClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    startsAt: getTodayString(),
    endsAt: getLaterTodayString(),
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const result = eventSchema.safeParse(form);
    if (result.success) {
      setErrors({});
      return true;
    }
    const errs: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string;
      errs[path] = issue.message;
    });
    setErrors(errs);
    return false;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      title: form.title,
      description: form.description || null,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      location: form.location || null,
    };

    try {
      if (editingEvent) {
        // Edit flow: PUT /event/:id
        const updated = await api(`/event/${editingEvent.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        if (updated) {
          setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...payload } : e));
          setSuccessMsg("Event updated successfully!");
          handleCancelEdit();
        }
      } else {
        // Create flow: POST /hackathon/:id/events
        const created = await api(`/hackathon/${hackathon.id}/events`, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (created) {
          setEvents(prev => [...prev, created].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()));
          setSuccessMsg("Event added successfully!");
          setForm({
            title: "",
            description: "",
            startsAt: getTodayString(),
            endsAt: getLaterTodayString(),
            location: "",
          });
        }
      }
    } catch (err: any) {
      console.error("Save event failed:", err);
      setError(err?.message || "Failed to save event schedule.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (event: EventItem) => {
    setEditingEvent(event);
    setError(null);
    setSuccessMsg(null);
    setForm({
      title: event.title,
      description: event.description || "",
      startsAt: formatDateForInput(event.startsAt),
      endsAt: formatDateForInput(event.endsAt),
      location: event.location || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setForm({
      title: "",
      description: "",
      startsAt: getTodayString(),
      endsAt: getLaterTodayString(),
      location: "",
    });
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event from the schedule?")) {
      return;
    }

    try {
      await api(`/event/${id}`, {
        method: "DELETE",
      });
      setEvents(prev => prev.filter(e => e.id !== id));
      setSuccessMsg("Event deleted successfully!");
    } catch (err: any) {
      console.error("Delete event failed:", err);
      setError(err?.message || "Failed to delete event.");
    }
  };

  return (
    <div className="space-y-6 font-body">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/organizer/hackathons"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="font-display font-bold text-2xl text-on-surface tracking-tight">
            Schedule & Events Manager
          </h1>
          <p className="text-xs text-on-surface-variant">
            Create, update, and sequence timeline events for <strong className="text-on-surface">{hackathon.name}</strong>
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-status-success/10 border border-status-success/20 text-status-success px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <Check className="h-5 w-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-status-error/10 border border-status-error/20 text-status-error px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side (7 columns) - Timeline list of events */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-display font-bold text-lg text-on-surface flex items-center gap-2 border-b border-outline-variant pb-2">
            <Calendar className="h-5 w-5 text-primary" /> Active Timeline ({events.length} Events)
          </h2>
          
          {events.length === 0 ? (
            <div className="bg-surface-container-lowest border border-outline-variant p-10 rounded-2xl text-center">
              <Calendar className="h-10 w-10 text-outline/50 mx-auto mb-3" />
              <h3 className="font-semibold text-on-surface text-sm">No events scheduled</h3>
              <p className="text-xs text-on-surface-variant mt-1">Use the form on the right to schedule the kickoff, workshops, or submission deadlines.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className={`bg-surface-container-lowest border rounded-2xl p-5 shadow-sm space-y-3 transition-colors hover:border-outline ${
                    editingEvent?.id === event.id ? "border-primary ring-1 ring-primary/20" : "border-outline-variant"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-on-surface text-sm">{event.title}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs text-on-surface-variant mt-1.5 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-outline" />
                          {new Date(event.startsAt).toLocaleString()} — {new Date(event.endsAt).toLocaleString()}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1 bg-surface-container px-2 py-0.5 rounded border border-outline-variant/60 font-sans text-[10px] font-semibold text-on-surface">
                            <MapPin className="h-3.5 w-3.5 text-outline" /> {event.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleEditClick(event)}
                        title="Edit Event"
                        className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(event.id)}
                        title="Delete Event"
                        className="p-1.5 text-on-surface-variant hover:text-status-error hover:bg-status-error/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-low/40 p-3 rounded-lg border border-outline-variant/30">
                      {event.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side (5 columns) - Add / Edit Form */}
        <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant p-6 rounded-2xl shadow-sm space-y-5">
          <h2 className="font-display font-bold text-base text-on-surface border-b border-outline-variant/70 pb-3 flex items-center gap-1.5">
            {editingEvent ? <Edit3 className="h-4.5 w-4.5 text-primary" /> : <Plus className="h-4.5 w-4.5 text-primary" />}
            {editingEvent ? "Modify Event" : "Add Timeline Event"}
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-xs font-semibold text-on-surface">
                Event Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g. Kickoff Ceremony"
                value={form.title}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.title ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.title && (
                <p className="text-xs text-status-error font-medium">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-xs font-semibold text-on-surface">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="Enter event details, links, guidelines..."
                value={form.description}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.description ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.description && (
                <p className="text-xs text-status-error font-medium">{errors.description}</p>
              )}
            </div>

            {/* Starts At */}
            <div className="space-y-1.5">
              <label htmlFor="startsAt" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-outline" /> Starts At
              </label>
              <input
                id="startsAt"
                name="startsAt"
                type="datetime-local"
                value={form.startsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.startsAt ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.startsAt && (
                <p className="text-xs text-status-error font-medium">{errors.startsAt}</p>
              )}
            </div>

            {/* Ends At */}
            <div className="space-y-1.5">
              <label htmlFor="endsAt" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-outline" /> Ends At
              </label>
              <input
                id="endsAt"
                name="endsAt"
                type="datetime-local"
                value={form.endsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.endsAt ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.endsAt && (
                <p className="text-xs text-status-error font-medium">{errors.endsAt}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-semibold text-on-surface flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-outline" /> Location / Meeting Link
              </label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Zoom link or Room 402"
                value={form.location}
                onChange={handleChange}
                className={`w-full px-4 py-2 text-sm border rounded-xl bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all ${
                  errors.location ? "border-status-error focus:border-status-error focus:ring-status-error" : "border-outline-variant"
                }`}
              />
              {errors.location && (
                <p className="text-xs text-status-error font-medium">{errors.location}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-3">
              {editingEvent && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 py-2 text-center border border-outline-variant hover:bg-surface-container rounded-xl text-xs font-semibold text-on-surface transition-all"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 bg-primary-container text-on-primary rounded-xl text-xs font-semibold hover:opacity-95 transition-all shadow-sm disabled:opacity-75"
              >
                {submitting ? "Saving..." : editingEvent ? "Update Event" : "Schedule Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
