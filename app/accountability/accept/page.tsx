import { getDb } from "@/app/lib/mongodb";
import { AccountabilityAcceptClient } from "./AccountabilityAcceptClient";

type Props = { searchParams: Promise<{ token?: string }> };

export default async function AccountabilityAcceptPage({ searchParams }: Props) {
  const params = await searchParams;
  const token = params.token?.trim();

  if (!token) {
    return (
      <main className="min-h-screen bg-[#F9F8F5] dark:bg-[#171510] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-8 text-center shadow-sm">
          <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Invalid or missing invite link.</p>
        </div>
      </main>
    );
  }

  const db = await getDb();
  const doc = await db.collection("accountability").findOne({ token, status: { $in: ["pending", "accepted"] } });

  if (!doc) {
    return (
      <main className="min-h-screen bg-[#F9F8F5] dark:bg-[#171510] flex items-center justify-center p-6">
        <div className="max-w-sm w-full rounded-xl border border-stone-200 dark:border-[#2a2720] bg-white dark:bg-[#1e1c18] p-8 text-center shadow-sm">
          <p className="text-sm text-stone-500 dark:text-[#7e7b72]">Invalid or expired invite link.</p>
        </div>
      </main>
    );
  }

  await db.collection("accountability").updateOne(
    { _id: doc._id },
    { $set: { status: "accepted", updatedAt: new Date() } }
  );

  return <AccountabilityAcceptClient token={token} />;
}
