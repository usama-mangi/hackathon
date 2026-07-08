import React from "react";
import { notFound } from "next/navigation";
import { api } from "@/src/lib/api";
import CountdownTimer from "@/src/components/ui/CountdownTimer";
import { Calendar, Clock, MapPin, Mail } from "lucide-react";

export const dynamic = "force-dynamic";

interface EventItem {
  id: string;
  hackathonId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  location: string | null;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HackathonEventsPage({ params }: PageProps) {
  const { id } = await params;
  let hackathon;
  let events: EventItem[] = [];

  try {
    [hackathon, events] = await Promise.all([
      api(`/hackathon/${id}`),
      api(`/hackathon/${id}/events`),
    ]);
  } catch (err) {
    console.error("Failed to load events data:", err);
    notFound();
  }

  // Sort events chronologically
  events.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());

  const formatEventTime = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    const timeOptions: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
    
    const dateFormatted = start.toLocaleDateString("en-US", options);
    const startFormatted = start.toLocaleTimeString("en-US", timeOptions);
    const endFormatted = end.toLocaleTimeString("en-US", timeOptions);
    
    return `${dateFormatted}, ${startFormatted} - ${endFormatted}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-4 items-start">
      {/* Left Column: Timeline */}
      <div className="lg:col-span-8 space-y-6">
        <h2 className="font-display font-bold text-xl text-on-surface">Event Schedule</h2>

        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-outline-variant rounded-xl bg-surface-container-low">
            <Calendar className="w-12 h-12 text-outline mb-4" />
            <h3 className="font-display font-semibold text-lg text-on-surface">No Scheduled Events</h3>
            <p className="text-sm text-on-surface-variant mt-1">There are no agenda events scheduled for this hackathon yet.</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-8 before:absolute before:inset-y-0 before:left-6 before:w-[2px] before:bg-outline-variant">
            {events.map((event, idx) => {
              const isDeadline = event.title.toLowerCase().includes("deadline") || event.title.toLowerCase().includes("submission");
              return (
                <div key={event.id} className="relative flex gap-6 group">
                  {/* Timeline bullet dot */}
                  <div className="absolute -left-[5px] top-1.5 z-10 flex items-center justify-center">
                    <div className={`w-3.5 h-3.5 rounded-full border-[3px] border-surface-container-lowest box-content ${
                      isDeadline ? "bg-status-warning scale-110" : "bg-status-success"
                    }`} />
                  </div>

                  {/* Card Container */}
                  <div className={`bg-surface-container-lowest border rounded-xl p-5 flex-1 shadow-sm hover:shadow transition-all ${
                    isDeadline ? "border-status-warning/45 bg-status-warning/5" : "border-outline-variant"
                  }`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                      <h3 className="font-display font-bold text-base text-on-surface">
                        {event.title}
                      </h3>
                      <button className="text-xs font-semibold text-on-surface border border-outline-variant hover:bg-surface-container-low px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Add to calendar
                      </button>
                    </div>

                    {event.description && (
                      <p className="text-xs text-on-surface-variant mb-4 leading-relaxed whitespace-pre-line">
                        {event.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-on-surface-variant font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-outline" />
                        <span>{formatEventTime(event.startsAt, event.endsAt)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1.5 font-sans text-xs">
                          <MapPin className="h-4 w-4 text-outline" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Sidebar */}
      <div className="lg:col-span-4 space-y-6">
        {/* Submission Countdown */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-sm text-on-surface mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            Countdown to Submission
          </h3>
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/60">
            <CountdownTimer targetDate={hackathon.endsAt} />
          </div>
        </div>

        {/* Featured Mentors */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-sm">
          <h3 className="font-display font-bold text-sm text-on-surface mb-4">Featured Mentors</h3>
          <div className="space-y-4">
            {[
              { name: "Sarah Jenkins", role: "AI Ethics Lead", initial: "SJ", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAQj7XGGGN3MdN4Y3-UPoCl8LQw6QRIfR4RE-I8X7zSix2j8TZnIQjk9I8VQZZayXHo-DKLgBHtD518tnB4Q6wgV23u79wxsDizVpQe4uXtqHoifCWJcR8OmV22pYPb95RkWKVficPuKF014rp1fbAXxXC78mnAMdi7CJm6d5GlAyIqGDtQKerWrDaBZD6SZaBJtkGyk_mU9A93VGI7IQMGO91lNNrRapgLA7uSwGBDo5LXJLV-ZduGNQ2uRFJns0HLnJXjZa3isEs" },
              { name: "David Wu", role: "Sr. ML Engineer", initial: "DW", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpcMP3RjW3YWRCphl1CVyomr5TIH7j6jB8U4jGhAABdF6aHLSX_GxyBkuTSPKdFFt6M1A6jd2y_SDuuFFLCntXzUX-l_CfNuXCnpd1FVBHXTl83p9dvKUDoGGApntSmvKS5HxISYvAtdM6pneEw3tWSjFHN81SWeiTGZU-28fBtesd1lTPyIIF6bjbkzgOVjqVuK8LcfNRtBlZl2SmropK_PZ6FlTH4nEausIIMvLZiKxXEaaz5WKoKrss5XHWIWHcjyO2Agrctqk" },
              { name: "Elena Rostova", role: "Data Scientist", initial: "ER", img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP1xAPyZJmzJ5zpe00b7meOwn0lES8eNci0rtnF1WEcUN5hd8I2fOPsKdNhQ2kEfz32AA7AmWCXLLEEHEbbzWHf1aDEel5k3zbFEvuvwflaTKL_esorFiJUTGGGqZ_LuWqHXgkKi0NRrybasAqOro9ay85GTdgzKf2kObjHbL8_M45UepEgZSuCQsehsjRGLyrdUGEiuYFMfd-95fh4saKyvh5hQodaYYbSAy7GYqiPD1JP0nDbSC66f3jdvBkabJ4CQGwIL_WcXo" }
            ].map((mentor, i) => (
              <div key={i} className="flex items-center gap-3">
                <img
                  src={mentor.img}
                  alt={mentor.name}
                  className="w-8 h-8 rounded-full object-cover border border-outline-variant"
                />
                <div>
                  <div className="text-xs font-semibold text-on-surface">{mentor.name}</div>
                  <div className="text-[10px] text-on-surface-variant font-mono">{mentor.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
