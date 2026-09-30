import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";

export async function getCurrentSession() {
  return auth.api.getSession({ headers: await headers() });
}
