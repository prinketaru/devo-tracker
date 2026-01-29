import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

export const auth = betterAuth({
  // Simple local dev DB. For production, switch to Postgres/MySQL/etc.
  database: new Database("./sqlite.db"),

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    },
  },
});

