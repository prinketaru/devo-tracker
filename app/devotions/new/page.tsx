import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";
import DevotionWorkspaceClient from "./DevotionWorkspaceClient";

export default async function NewDevotionPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  return (
    <DevotionWorkspaceClient />
  );
}

