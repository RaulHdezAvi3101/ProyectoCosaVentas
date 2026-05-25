"use client";

import { SessionProvider } from "@/lib/auth/session-provider";
import { BottomNav } from "./BottomNav";
import { DemoBanner } from "./DemoBanner";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-surface pb-20">
        <DemoBanner />
        {children}
        <BottomNav />
      </div>
    </SessionProvider>
  );
}
