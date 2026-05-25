import type { UserRole } from "@prisma/client";

export type { UserRole as SessionRole };

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  role: UserRole;
  avatarUrl: string | null;
  legacyGuestId: string | null;
}
