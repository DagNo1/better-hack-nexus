"use client";

import { Button } from "@workspace/ui/components/button";
import type { ReactNode } from "react";
import { PageLayout } from "./page-layout";

interface NotFoundStateProps {
  header?: ReactNode;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  className?: string;
}

export function NotFoundState({
  header,
  title = "Not Found",
  description = "The resource you're looking for doesn't exist or you don't have permission to view it.",
  action,
  className = "",
}: NotFoundStateProps) {
  return (
    <PageLayout header={header} className={className}>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        {action && (
          <Button onClick={action.onClick}>
            {action.icon}
            {action.label}
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
