"use client";

import type { ReactNode } from "react";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  UserButton,
} from "@daveyplate/better-auth-ui";

interface AuthWrapperProps {
  children: ReactNode;
  signedInContent?: ReactNode;
  signedOutContent?: ReactNode;
  fallback?: ReactNode;
  userButtonClassName?: string;
}

export function AuthWrapper({
  children,
  signedInContent,
  signedOutContent,
  fallback,
  userButtonClassName,
}: AuthWrapperProps) {
  return (
    <>
      <SignedIn>
        <div className="flex flex-col items-end justify-between py-4">
          {userButtonClassName && (
            <UserButton
              className={`bg-background text-white hover:bg-primary/10 ${userButtonClassName}`}
            />
          )}
          {signedInContent || children}
        </div>
      </SignedIn>
      <SignedOut>
        {signedOutContent || fallback || <RedirectToSignIn />}
      </SignedOut>
    </>
  );
}
