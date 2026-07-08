import React from "react";

export default function HackathonsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 w-full flex-grow">
      {/* Title section skeleton */}
      <div className="mb-8 flex flex-col gap-2">
        <div className="h-9 w-64 bg-surface-container-high rounded animate-pulse" />
        <div className="h-5 w-96 bg-surface-container rounded animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col justify-between h-[260px] shadow-sm animate-pulse"
          >
            <div>
              <div className="flex justify-between items-start gap-4 mb-4">
                <div className="h-6 w-3/4 bg-surface-container-high rounded" />
                <div className="h-6 w-16 bg-surface-container rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-1/2 bg-surface-container rounded" />
                <div className="h-4 w-1/3 bg-surface-container rounded" />
              </div>
            </div>

            <div className="mt-8 flex justify-between items-center pt-4 border-t border-outline-variant/60">
              <div className="flex gap-4">
                <div className="h-8 w-12 bg-surface-container rounded" />
                <div className="h-8 w-12 bg-surface-container rounded" />
              </div>
              <div className="h-9 w-24 bg-surface-container rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
