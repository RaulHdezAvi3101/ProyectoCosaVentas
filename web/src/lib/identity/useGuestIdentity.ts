"use client";

import { useEffect, useState } from "react";

const STORAGE_ID = "cosaventas_guest_id";
const STORAGE_NAME = "cosaventas_guest_name";

const DEMO_NAMES = [
  "Carlos R.",
  "Ana M.",
  "Diego P.",
  "Sofía L.",
  "Miguel T.",
  "Laura V.",
];

function randomName() {
  return DEMO_NAMES[Math.floor(Math.random() * DEMO_NAMES.length)];
}

export function useGuestIdentity() {
  const [guestId, setGuestId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_ID);
    if (!id) {
      id = `guest-${crypto.randomUUID().slice(0, 8)}`;
      localStorage.setItem(STORAGE_ID, id);
    }

    let name = localStorage.getItem(STORAGE_NAME);
    if (!name) {
      name = randomName();
      localStorage.setItem(STORAGE_NAME, name);
    }

    setGuestId(id);
    setDisplayName(name);
  }, []);

  return {
    guestId: guestId ?? "",
    displayName: displayName ?? "Invitado",
    ready: Boolean(guestId && displayName),
  };
}
