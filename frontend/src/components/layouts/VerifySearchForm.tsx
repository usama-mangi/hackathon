"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchFormProps {
  initialValue?: string;
}

export default function VerifySearchForm({ initialValue = "" }: SearchFormProps) {
  const router = useRouter();
  const [certId, setCertId] = useState(initialValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = certId.trim();
    if (!cleanId) return;

    // Transition to the target route to trigger server verification
    router.push(`/certificates/verify/${cleanId}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full">
      <div className="relative flex-grow">
        <input
          value={certId}
          onChange={(e) => setCertId(e.target.value)}
          aria-label="Certificate ID"
          className="w-full h-11 pl-4 pr-10 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface font-mono text-sm focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none placeholder-outline/65 transition-all"
          placeholder="E.g. A1B2-C3D4-EF012345"
          type="text"
          required
        />
        <Search className="h-4 w-4 text-outline absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      <button
        type="submit"
        className="h-11 px-6 bg-primary-container text-on-primary rounded-lg font-semibold text-xs uppercase tracking-wider hover:bg-opacity-95 transition-opacity"
      >
        Verify
      </button>
    </form>
  );
}
