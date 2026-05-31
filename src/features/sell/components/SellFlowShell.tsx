"use client";

import { CaptureSessionProvider } from "@/features/sell/context/CaptureSessionContext";
import { SellFlowStepper } from "@/features/sell/components/SellFlowStepper";

export function SellFlowShell({ children }: { children: React.ReactNode }) {
  return (
    <CaptureSessionProvider>
      <SellFlowStepper />
      {children}
    </CaptureSessionProvider>
  );
}
