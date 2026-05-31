import type { UserRole } from "@prisma/client";

export interface SessionUser {
  id: string;
  email: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  role: UserRole;
}

export interface AuthSession {
  sessionId: string;
  user: SessionUser;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  handle: string;
  avatarUrl: string;
  sellerProfile: {
    score: number;
    tier: string;
    sales: number;
    positiveRate: number;
    onTimeShipping: number;
    avgShipHours: number;
    responseRate: number;
    memberSince: string;
  };
}
