import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongodb";

/** GET /api/health – health check for load balancers, uptime monitors. */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
  let status: "ok" | "degraded" = "ok";

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    checks.mongodb = "ok";
  } catch {
    checks.mongodb = "error";
    status = "degraded";
  }

  return NextResponse.json(
    { status, checks, timestamp: new Date().toISOString() },
    { status: status === "ok" ? 200 : 503 }
  );
}
