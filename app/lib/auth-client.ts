import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

/** Better Auth client for React (sign-in, OTP, session). */
export const authClient = createAuthClient({
  plugins: [emailOTPClient()],
});

