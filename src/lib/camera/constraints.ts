import { detectCameraPlatform } from "@/lib/camera/platform";

export function isMobileCameraDevice(): boolean {
  return detectCameraPlatform() !== "desktop";
}

export function buildCameraConstraintAttempts(
  deviceId?: string,
): MediaStreamConstraints[] {
  const attempts: MediaStreamConstraints[] = [];

  if (deviceId) {
    attempts.push({
      audio: false,
      video: {
        deviceId: { exact: deviceId },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    attempts.push({
      audio: false,
      video: { deviceId: { exact: deviceId } },
    });
    return attempts;
  }

  if (isMobileCameraDevice()) {
    attempts.push({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    attempts.push({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
  } else {
    // PC / laptop: webcam integrada o USB — sin facingMode (no existe "trasera")
    attempts.push({
      audio: false,
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    });
    attempts.push({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  }

  attempts.push({ audio: false, video: true });
  return attempts;
}

export async function openCameraStream(deviceId?: string): Promise<MediaStream> {
  const attempts = buildCameraConstraintAttempts(deviceId);
  let lastError: unknown;

  for (const constraints of attempts) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      lastError = error;

      if (error instanceof DOMException) {
        // Permiso denegado no se arregla con constraints más laxas
        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          throw error;
        }
      }
    }
  }

  throw lastError ?? new Error("No se pudo abrir la cámara.");
}

export function mapCameraError(error: unknown): {
  permission: "denied" | "unknown";
  message: string;
} {
  if (error instanceof DOMException) {
    switch (error.name) {
      case "NotAllowedError":
      case "PermissionDeniedError":
        return {
          permission: "denied",
          message: "Permiso de cámara denegado.",
        };
      case "NotFoundError":
      case "DevicesNotFoundError":
        return {
          permission: "unknown",
          message: isMobileCameraDevice()
            ? "No encontramos una cámara en este dispositivo."
            : "No detectamos webcam. Conecta una cámara USB o revisa que esté habilitada.",
        };
      case "NotReadableError":
      case "TrackStartError":
        return {
          permission: "unknown",
          message:
            "La cámara está en uso por otra app (Zoom, Teams, etc.). Ciérrala e intenta de nuevo.",
        };
      case "OverconstrainedError":
        return {
          permission: "unknown",
          message: "Esta cámara no soporta la resolución pedida. Prueba otra cámara.",
        };
      case "SecurityError":
        return {
          permission: "denied",
          message:
            "El navegador bloqueó la cámara. Usa HTTPS o localhost para publicar.",
        };
      default:
        break;
    }
  }

  return {
    permission: "unknown",
    message: "No se pudo iniciar la cámara. Intenta de nuevo.",
  };
}
