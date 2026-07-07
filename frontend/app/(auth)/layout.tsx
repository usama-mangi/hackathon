import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {children}
    </div>
  );
}
