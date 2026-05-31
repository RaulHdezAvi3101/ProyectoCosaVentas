import { authLogoutResponse } from "@/features/auth/api-helpers";
import { logout } from "@/features/auth/logout";

export async function POST() {
  await logout();
  return authLogoutResponse();
}
