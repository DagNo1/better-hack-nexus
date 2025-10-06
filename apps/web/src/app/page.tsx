"use client";
import { ProjectsList } from "@/layouts/home/projects-list";
import ResourcesTableLayout from "@/layouts/home/resources-table-layout";
import UsersTableLayout from "@/layouts/home/user-table-layout";
import { ProjectUsersTable } from "@/layouts/home/project-users-table";
import { FolderUsersTable } from "@/layouts/home/folder-users-table";
import { authClient } from "@/lib/auth-client";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";
import { Badge } from "@workspace/ui/components/badge";

export default function Home() {
  authClient.zanzibar.matrix().then((resources) => {
    console.log(resources);
  });
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
                A Demo app for showing how the  Google Zanzibar ReBAC works
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
          <div className="flex flex-col gap-4">
            <ProjectsList />
            <Badge className="text-2xl font-bold">Resources</Badge>
            <ResourcesTableLayout />
            <Badge className="text-2xl font-bold">Project Users</Badge>
            <ProjectUsersTable />
            <Badge className="text-2xl font-bold">Folder Users</Badge>
            <FolderUsersTable />
          </div>
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
