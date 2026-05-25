"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/types/auth";
import {
  SESSION_REFRESH_EVENT,
  dispatchSessionRefresh,
} from "./session-events";

interface SessionContextValue {
  user: SessionUser | null;
  ready: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = (event: Event) => {
      const detail = (event as CustomEvent<{ user?: SessionUser | null }>)
        .detail;
      if (detail && "user" in detail) {
        setUser(detail.user ?? null);
        setReady(true);
        return;
      }
      void refresh();
    };
    window.addEventListener(SESSION_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(SESSION_REFRESH_EVENT, onRefresh);
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
    dispatchSessionRefresh(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      refresh,
      logout,
      isLoggedIn: Boolean(user),
    }),
    [user, ready, refresh, logout]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return ctx;
}
