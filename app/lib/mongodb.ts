import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable inside .env"
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

/**
 * Cached MongoDB client promise. Reused across hot reloads in development
 * and across serverless invocations in production.
 */
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = new MongoClient(MONGO_URI).connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = new MongoClient(MONGO_URI).connect();
}

/**
 * Returns the MongoDB client. Use this for low-level access.
 */
export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}

/**
 * Returns a MongoDB database instance. Defaults to the "devo-tracker" database
 * if no name is provided.
 */
export async function getDb(dbName = "devo-tracker"): Promise<Db> {
  const client = await getMongoClient();
  return client.db(dbName);
}

export { clientPromise };
