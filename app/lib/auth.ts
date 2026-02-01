import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { emailOTP } from "better-auth/plugins/email-otp";
import { getDb, getMongoClient } from "./mongodb";
import { sendEmail } from "./smtp2go";
import { getOtpEmail } from "./email-templates";
import { checkOtpLimit, recordOtpSent } from "./rate-limits";

const client = await getMongoClient();
const db = await getDb();

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  database: mongodbAdapter(db, { client }),
  trustedOrigins: [baseUrl],

  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const otpLimit = await checkOtpLimit(email);
        if (!otpLimit.allowed) {
          throw new Error(otpLimit.reason);
        }
        const { subject, text, html } = getOtpEmail(otp, type);
        const { ok } = await sendEmail({ to: email, subject, text, html });
        if (ok) {
          await recordOtpSent(email);
        }
      },
    }),
  ],

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // For email OTP sign-in, name is empty; use email prefix as default
          if ((!user.name || user.name.trim() === "") && typeof user.email === "string") {
            const prefix = user.email.split("@")[0]?.trim();
            if (prefix) return { data: { name: prefix } };
          }
        },
      },
    },
  },

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

