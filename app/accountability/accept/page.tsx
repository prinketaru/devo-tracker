import { getDb } from "@/app/lib/mongodb";
import { AccountabilityAcceptClient } from "./AccountabilityAcceptClient";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function AccountabilityAcceptPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">Invalid or missing invite link.</p>
      </main>
    );
  }

  const db = await getDb();
  const doc = await db.collection("accountability").findOne({ token, status: { $in: ["pending", "accepted"] } });

  if (!doc) {
    return (
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center p-6">
        <p className="text-sm text-stone-600 dark:text-stone-400">Invalid or expired invite link.</p>
      </main>
    );
  }

  await db.collection("accountability").updateOne(
    { _id: doc._id },
    { $set: { status: "accepted", updatedAt: new Date() } }
  );

  return <AccountabilityAcceptClient token={token} />;
}
