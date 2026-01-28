import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // If you change the auth base path, include it here (e.g. "/api/auth")
  // For default Next.js setup this can be omitted.
});

