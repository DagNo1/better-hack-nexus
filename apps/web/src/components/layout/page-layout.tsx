"use client";

import type { ReactNode } from "react";

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  header?: ReactNode;
  maxWidth?: string;
}

export function PageLayout({
  children,
  className = "",
  header,
  maxWidth = "w-5xl",
}: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-transparent ${maxWidth} relative ${className}`}
    >
      {header && (
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">{header}</div>
        </header>
      )}
      <main className="w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
