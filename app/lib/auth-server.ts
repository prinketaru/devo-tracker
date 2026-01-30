import { headers } from "next/headers";
import { auth } from "@/app/lib/auth";

/** Returns the current session or null. Use in server components and API routes. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
