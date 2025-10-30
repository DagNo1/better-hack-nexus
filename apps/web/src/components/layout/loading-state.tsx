"use client";

import type { ReactNode } from "react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { PageLayout } from "./page-layout";

interface LoadingStateProps {
  header?: ReactNode;
  title?: string;
  sections?: number;
  className?: string;
}

export function LoadingState({
  header,
  title,
  sections = 2,
  className = "",
}: LoadingStateProps) {
  const skeletonSections = Array.from({ length: sections }, (_, i) => (
    <Skeleton key={i} className="h-64 w-full" />
  ));

  return (
    <PageLayout header={header} className={className}>
      <div className="space-y-6">
        {title && <Skeleton className="h-10 w-32" />}
        {skeletonSections}
      </div>
    </PageLayout>
  );
}
