/**
 * Helper to look up Better Auth users in MongoDB.
 * Better Auth stores user ID as _id (ObjectId); we support both _id and id for compatibility.
 */

import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";

const USER_COLLECTIONS = ["user", "users"] as const;

export type UserLookupResult = { email?: string; name?: string } | null;

/** Look up a user by their Better Auth user ID (supports both _id and id). */
export async function findUserByAuthId(userId: string): Promise<UserLookupResult> {
  const db = await getDb();
  let query: { _id?: ObjectId; id?: string } = { id: userId };
  if (userId.length === 24 && /^[a-f0-9]{24}$/i.test(userId)) {
    try {
      query = { _id: new ObjectId(userId) };
    } catch {
      // keep { id: userId }
    }
  }

  for (const collName of USER_COLLECTIONS) {
    try {
      const user = (await db
        .collection(collName)
        .findOne(query)) as UserLookupResult;
      if (user) return user;
    } catch {
      // try next collection
    }
  }
  return null;
}
