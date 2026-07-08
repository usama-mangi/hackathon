"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  videoUrl: string | null;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
    /youtube\.com\/shorts\/([^&?/\s]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [playing, setPlaying] = useState(false);

  // No video provided
  if (!videoUrl) {
    return (
      <div className="aspect-video w-full bg-slate-900 rounded-xl flex flex-col items-center justify-center border border-outline-variant shadow-sm">
        <Play className="h-10 w-10 text-slate-600 mb-3" />
        <p className="text-sm text-slate-500 font-mono">No demo video submitted</p>
      </div>
    );
  }

  const youtubeId = getYouTubeId(videoUrl);
  const vimeoId = getVimeoId(videoUrl);
  const isDirectVideo = !youtubeId && !vimeoId;

  // YouTube embed
  if (youtubeId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-slate-900">
        {!playing ? (
          // Click-to-play thumbnail using YouTube's HQ thumbnail API
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group"
            aria-label="Play video"
          >
            <img
              src={`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`}
              alt={title ? `${title} demo thumbnail` : "Video thumbnail"}
              className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-xl transition-all group-hover:scale-110">
                <Play className="h-7 w-7 text-white fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/70">
              YouTube · Demo Walkthrough
            </div>
          </button>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={title || "Demo video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // Vimeo embed
  if (vimeoId) {
    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-slate-900">
        {!playing ? (
          <button
            onClick={() => setPlaying(true)}
            className="relative w-full h-full group bg-slate-800 flex items-center justify-center"
            aria-label="Play video"
          >
            <div className="w-16 h-16 bg-[#1ab7ea] hover:bg-[#1aace8] rounded-full flex items-center justify-center shadow-xl transition-all group-hover:scale-110">
              <Play className="h-7 w-7 text-white fill-current ml-1" />
            </div>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-white/70">
              Vimeo · Demo Walkthrough
            </div>
          </button>
        ) : (
          <iframe
            className="w-full h-full"
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1`}
            title={title || "Demo video"}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    );
  }

  // Direct video file (mp4, webm, etc.)
  return (
    <div className="aspect-video w-full rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-slate-900">
      <video
        controls
        autoPlay={false}
        preload="metadata"
        className="w-full h-full object-contain"
        aria-label={title ? `${title} demo video` : "Demo video"}
      >
        <source src={videoUrl} />
        <p className="text-xs text-slate-400 p-4">
          Your browser does not support the video tag.{" "}
          <a href={videoUrl} className="underline text-primary" target="_blank" rel="noreferrer">
            Download the video
          </a>
        </p>
      </video>
    </div>
  );
}
