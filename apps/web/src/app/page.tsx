"use client";
import {
  RedirectToSignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@daveyplate/better-auth-ui";
import { useRouter } from "next/navigation";

export default function Home() {
  const { push } = useRouter();
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
