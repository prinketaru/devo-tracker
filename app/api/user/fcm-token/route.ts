import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/auth-server";
import { getDb } from "@/app/lib/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { token } = await req.json();

        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
                { status: 400 }
            );
        }

        const db = await getDb();

        // Convert session.user.id to ObjectId if possible
        let objectId: ObjectId | null = null;
        try {
            if (session.user.id.length === 24) {
                objectId = new ObjectId(session.user.id);
            }
        } catch (e) {
            // invalid object id, ignore
        }

        // Construct query:
        // Match by strict 'id' string OR by '_id' ObjectId (if valid)
        const query: any = { id: session.user.id };

        if (objectId) {
            // We use $or to match either field
            // But if we have an objectId, we construct the $or
            // If not, we just use the id (which is already set above)
            query["$or"] = [
                { id: session.user.id },
                { _id: objectId }
            ];
            // But wait, if we assign $or, it overrides the implicit AND of the top level properties?
            // Actually, simplest is:
        }

        const filter = objectId
            ? { $or: [{ id: session.user.id }, { _id: objectId }] }
            : { id: session.user.id };

        // Update user with FCM token
        const result = await db.collection("user").updateOne(
            filter,
            { $set: { fcmToken: token, updatedAt: new Date() } }
        );

        if (result.matchedCount === 0) {
            // Fallback for different collection name conventions
            await db.collection("users").updateOne(
                filter,
                { $set: { fcmToken: token, updatedAt: new Date() } }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error saving FCM token:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
