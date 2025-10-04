"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      enableColorScheme
    >
      <AuthUIProvider
        authClient={authClient}
        navigate={router.push}
        replace={router.replace}
        onSessionChange={() => {
          // Clear router cache (protected routes)
          router.refresh();
        }}
        Link={Link}
      >
        {children}
      </AuthUIProvider>
    </NextThemesProvider>
  );
}
