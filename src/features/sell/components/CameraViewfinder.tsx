"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { CameraErrorAlerts } from "@/features/sell/components/CameraErrorAlerts";
import { CaptureProgress } from "@/features/sell/components/CaptureProgress";
import { RetakePreviewBanner } from "@/features/sell/components/RetakePreviewBanner";
import { RuleOfThirdsOverlay } from "@/features/sell/components/RuleOfThirdsOverlay";
import { SellSectionHeader } from "@/features/sell/components/SellSectionHeader";
import { useCaptureSession } from "@/features/sell/context/CaptureSessionContext";
import { useRetakePhotoMeta } from "@/features/sell/hooks/use-retake-photo-meta";
import {
  getCaptureDescription,
  getViewfinderHint,
} from "@/features/sell/lib/capture-copy";
import { isMobileCameraDevice } from "@/lib/camera/constraints";
import { MAX_PHOTOS, MIN_PHOTOS } from "@/lib/camera/constants";
import { capturePhotoFromVideo } from "@/lib/camera/capture";
import { useCameraStream } from "@/lib/camera/use-camera-stream";
import { toErrorMessage } from "@/lib/errors/to-error-message";

export function CameraViewfinder() {
  const router = useRouter();
  const {
    photos,
    addPhoto,
    replacePhoto,
    canAddMore,
    retakePhotoId,
    clearRetake,
  } = useCaptureSession();
  const {
    videoRef,
    ready,
    permission,
    error,
    devices,
    activeDeviceId,
    startCamera,
    switchCamera,
    stopCamera,
  } = useCameraStream();
  const [capturing, setCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string>();

  const isMobile = isMobileCameraDevice();
  const showDevicePicker = ready && devices.length > 1;
  const canContinue = photos.length >= MIN_PHOTOS;
  const { isRetakeMode, retakeIndex, retakePhoto, retakeLabel } =
    useRetakePhotoMeta(photos, retakePhotoId);
  const canCapture = isRetakeMode || canAddMore;

  useEffect(() => {
    if (permission === "denied") {
      router.replace("/sell/camera/denied");
    }
  }, [permission, router]);

  useEffect(() => {
    if (retakePhotoId && retakeIndex < 0) {
      clearRetake();
    }
  }, [retakePhotoId, retakeIndex, clearRetake]);

  function goToPreview() {
    stopCamera();
    clearRetake();
    router.push("/sell/preview");
  }

  async function handleStart() {
    setCaptureError(undefined);
    await startCamera();
  }

  async function handleCapture() {
    const video = videoRef.current;
    if (!video || !ready || capturing || !canCapture) {
      return;
    }

    setCapturing(true);
    setCaptureError(undefined);

    try {
      const photo = await capturePhotoFromVideo(video);

      if (isRetakeMode && retakePhotoId) {
        replacePhoto(retakePhotoId, photo);
        goToPreview();
        return;
      }

      addPhoto(photo);
    } catch (cause) {
      setCaptureError(
        toErrorMessage(cause, "No se pudo capturar la foto."),
      );
    } finally {
      setCapturing(false);
    }
  }

  const captureButtonLabel = capturing
    ? "Capturando…"
    : isRetakeMode
      ? "Reemplazar foto"
      : canAddMore
        ? "Capturar foto"
        : `Máximo ${MAX_PHOTOS} fotos`;

  return (
    <section className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-3xl flex-col px-6 py-8">
      <SellSectionHeader
        eyebrow={isRetakeMode ? "Retomar foto" : "Captura en vivo"}
        title={
          isRetakeMode
            ? `Reemplaza la ${retakeLabel}`
            : "Toma las fotos de tu producto"
        }
        description={getCaptureDescription(isRetakeMode, isMobile)}
      />

      {isRetakeMode && retakePhoto ? (
        <RetakePreviewBanner photo={retakePhoto} photoIndex={retakeIndex} />
      ) : null}

      <div className="relative aspect-square overflow-hidden rounded-2xl border border-ink/10 bg-ink">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />

        {ready ? (
          <RuleOfThirdsOverlay hint={getViewfinderHint(isMobile)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white/80">
            {error ?? "Pulsa «Activar cámara» para comenzar."}
          </div>
        )}
      </div>

      {showDevicePicker ? (
        <Select
          label="Cámara"
          id="camera-device"
          value={activeDeviceId ?? ""}
          onChange={(event) => switchCamera(event.target.value)}
          className="mt-4"
        >
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </Select>
      ) : null}

      {!isRetakeMode ? (
        <CaptureProgress photos={photos} className="mt-4" />
      ) : null}

      <CameraErrorAlerts
        streamError={error}
        permission={permission}
        captureError={captureError}
      />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {!ready ? (
          <>
            <Button type="button" onClick={handleStart} className="flex-1">
              Activar cámara
            </Button>
            {isRetakeMode ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreview}
                className="flex-1"
              >
                Volver sin cambios
              </Button>
            ) : null}
          </>
        ) : (
          <>
            <Button
              type="button"
              onClick={handleCapture}
              disabled={capturing || !canCapture}
              className="min-h-[72px] flex-1 text-base"
            >
              {captureButtonLabel}
            </Button>
            {isRetakeMode ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreview}
                className="min-h-[72px] flex-1"
              >
                Cancelar
              </Button>
            ) : canContinue ? (
              <Button
                type="button"
                variant="secondary"
                onClick={goToPreview}
                className="min-h-[72px] flex-1"
              >
                Continuar ({photos.length} fotos)
              </Button>
            ) : null}
          </>
        )}
      </div>

      {canContinue && !ready && !isRetakeMode ? (
        <Button
          type="button"
          variant="secondary"
          onClick={goToPreview}
          className="mt-3 w-full"
        >
          Continuar con {photos.length} fotos
        </Button>
      ) : null}
    </section>
  );
}
