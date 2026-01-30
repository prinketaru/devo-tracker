import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDb, getMongoClient } from "./mongodb";

const client = await getMongoClient();
const db = await getDb();

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),

  user: {
    deleteUser: {
      enabled: true,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      overrideUserInfoOnSignIn: true,
      mapProfileToUser: (profile) => ({
        name: [profile.given_name, profile.family_name].filter(Boolean).join(" ") || profile.name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
      }),
    },
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      mapProfileToUser: (profile) => ({
        name: profile.global_name ?? profile.username,
        image: profile.avatar
          ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
          : undefined,
      }),
    },
  },
});

