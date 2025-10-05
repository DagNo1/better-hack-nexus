"use client";
import { authClient } from "@/lib/auth-client";

export default function UserTableLayout() {
  authClient.zanzibar.resources().then((resources) => {
    console.log(resources);
  });
  // const columns = useMemo(() => createResourceColumns(), []);

  return <div></div>;
}
