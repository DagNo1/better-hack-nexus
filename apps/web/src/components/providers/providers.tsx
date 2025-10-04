"use client";

import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { queryClient } from "@/utils/trpc";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

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
        <QueryClientProvider client={queryClient}>
          {children}
          <ReactQueryDevtools />
        </QueryClientProvider>
        <Toaster richColors />
      </AuthUIProvider>
    </NextThemesProvider>
  );
}
