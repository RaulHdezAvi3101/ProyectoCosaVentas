import { FormError } from "@/components/ui/FormError";
import type { CameraPermissionState } from "@/lib/camera/types";

interface CameraErrorAlertsProps {
  streamError?: string;
  permission: CameraPermissionState;
  captureError?: string;
}

export function CameraErrorAlerts({
  streamError,
  permission,
  captureError,
}: CameraErrorAlertsProps) {
  const showStreamError = streamError && permission !== "denied";

  if (!showStreamError && !captureError) {
    return null;
  }

  return (
    <div className="mt-4 space-y-4">
      {showStreamError ? <FormError message={streamError} /> : null}
      {captureError ? <FormError message={captureError} /> : null}
    </div>
  );
}
