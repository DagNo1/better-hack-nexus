"use client";

import type { ReactNode } from "react";
import { Button } from "@workspace/ui/components/button";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backTo?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  backTo,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-row w-full justify-between items-center ${className}`}
    >
      <div className="flex items-center gap-4">
        {(onBack || backTo) && (
          <Button
            variant={"secondary"}
            size="icon"
            onClick={onBack}
            {...(backTo && { asChild: true })}
          >
            {backTo ? (
              <a href={backTo}>
                <ArrowLeft className="h-5 w-5" />
              </a>
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}
