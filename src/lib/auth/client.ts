import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_APP_URL;

if (!baseURL) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL is not set. Next.js inlines NEXT_PUBLIC_* " +
      "variables into the client bundle at build time, so it must be " +
      "passed as a Docker build ARG (see Dockerfile) — setting it only as " +
      "a runtime container environment variable has no effect.",
  );
}

export const authClient = createAuthClient({
  baseURL,
});
