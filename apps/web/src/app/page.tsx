"use client";

import { ProjectsTable } from "@/layouts/tables/projects-table";
import { UsersTable } from "@/layouts/tables/users-table";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent w-5xl relative">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <SignedIn>
              <UserButton className="bg-background text-white hover:bg-primary/10" />
              <h1 className="text-2xl font-bold">Better Hack Nexus</h1>
              <p className="text-sm text-muted-foreground">
                A Demo app for showing how the Google Zanzibar ReBAC works
              </p>
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
          <div className="flex flex-col gap-8">
            <ProjectsTable />
            <UsersTable />
          </div>
        </SignedIn>
      </main>
    </div>
  );
}
