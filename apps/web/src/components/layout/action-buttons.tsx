"use client";

import { type ReactNode, useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { authClient } from "@/lib/auth-client";

interface ActionButton {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  onClick: () => void;
  permission?: {
    resourceType: string;
    resourceId: string;
    action: string;
  };
}

interface ActionButtonsProps {
  actions: ActionButton[];
  className?: string;
}

export function ActionButtons({ actions, className = "" }: ActionButtonsProps) {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const checkPermissions = async () => {
      const permissionChecks = actions
        .filter(action => action.permission)
        .map(async (action) => {
          if (!action.permission) return null;

          try {
            const result = await authClient.zanzibar.check({
              resourceType: action.permission.resourceType,
              resourceId: action.permission.resourceId,
              action: action.permission.action,
            });

            return {
              key: action.key,
              allowed: result.data && "allowed" in result.data ? result.data.allowed : false,
            };
          } catch (error) {
            console.error("Permission check failed:", error);
            return {
              key: action.key,
              allowed: false,
            };
          }
        });

      const results = await Promise.all(permissionChecks);
      const permissionMap: Record<string, boolean> = {};

      results.forEach(result => {
        if (result) {
          permissionMap[result.key] = result.allowed;
        }
      });

      // For actions without permissions, default to true
      actions.forEach(action => {
        if (!action.permission) {
          permissionMap[action.key] = true;
        }
      });

      setPermissions(permissionMap);
    };

    checkPermissions();
  }, [actions]);

  return (
    <div className={`flex gap-2 ${className}`}>
      {actions.map(action => {
        const canShow = permissions[action.key];

        if (canShow === false) return null;

        return (
          <Button
            key={action.key}
            variant={action.variant || "outline"}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
