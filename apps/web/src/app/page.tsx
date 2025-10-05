"use client";
import { ProjectsList } from "@/layouts/home/projects-list";
import { authClient } from "@/lib/auth-client";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";

export default function Home() {
  authClient.zanzibar.checkDetailed({
    action: "read",
    resourceType: "user",
    resourceId: "1",
    options: {
      include_details: true,
    },
  });
  return (
    <div className="min-h-screen bg-transparent w-3xl relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton className="bg-background text-white hover:bg-primary/10" />
            </SignedIn>
            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-4 py-8">
        <SignedIn>
          <ProjectsList />
        </SignedIn>
        <SignedOut>
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <h2 className="text-xl font-semibold mb-4">
              Welcome to Better Hack Nexus
            </h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your projects
            </p>
            <RedirectToSignIn />
          </div>
        </SignedOut>
      </main>
    </div>
  );
}
