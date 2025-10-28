"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

interface CanAccessProps {
  resourceType: string;
  resourceId: string;
  action: string;
  children: React.ReactNode;
}

export function CanAccess({
  resourceType,
  resourceId,
  action,
  children,
}: CanAccessProps) {
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      setLoading(true);
      const result = await authClient.zanzibar.check({
        resourceType,
        resourceId,
        action,
      });
      setAllowed(result.data?.allowed ?? false);
      setLoading(false);
    };

    checkPermission();
  }, [resourceType, resourceId, action]);

  if (loading) return null;
  if (!allowed) return null;

  return <>{children}</>;
}
