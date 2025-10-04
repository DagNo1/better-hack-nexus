"use client";
import { authClient } from "@/lib/auth-client";
import { trpc } from "@/utils/trpc";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";

export default function Home() {
  const result = authClient.zanzibar.checkDetailed({
    action: "read",
    resourceType: "user",
    resourceId: "1",
    options: {
      include_details: true,
    },
  });

  const todo = trpc.todo.getAll.queryOptions();
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex justify-center my-8">
        <RedirectToSignIn />
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
      </div>
    </div>
  );
}
