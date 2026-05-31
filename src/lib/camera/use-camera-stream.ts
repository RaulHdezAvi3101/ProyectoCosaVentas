"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  mapCameraError,
  openCameraStream,
} from "@/lib/camera/constraints";
import { listVideoInputDevices, type VideoInputDevice } from "@/lib/camera/devices";
import type { CameraPermissionState } from "@/lib/camera/types";

interface UseCameraStreamResult {
  videoRef: React.RefObject<HTMLVideoElement>;
  ready: boolean;
  permission: CameraPermissionState;
  error?: string;
  devices: VideoInputDevice[];
  activeDeviceId?: string;
  startCamera: (deviceId?: string) => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  stopCamera: () => void;
}

export function useCameraStream(): UseCameraStreamResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [permission, setPermission] = useState<CameraPermissionState>("unknown");
  const [error, setError] = useState<string>();
  const [devices, setDevices] = useState<VideoInputDevice[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string>();

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setReady(false);
  }, []);

  const attachStream = useCallback(async (stream: MediaStream) => {
    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.srcObject = stream;
    await video.play();
    setReady(true);

    const track = stream.getVideoTracks()[0];
    const settings = track?.getSettings();
    if (settings?.deviceId) {
      setActiveDeviceId(settings.deviceId);
    }
  }, []);

  const refreshDevices = useCallback(async () => {
    const inputs = await listVideoInputDevices();
    setDevices(inputs);
    return inputs;
  }, []);

  const startCamera = useCallback(
    async (deviceId?: string) => {
      setError(undefined);
      stopCamera();

      if (!window.isSecureContext) {
        setPermission("denied");
        setError(
          "La cámara requiere una conexión segura (HTTPS o localhost).",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermission("denied");
        setError("Tu navegador no soporta acceso a la cámara.");
        return;
      }

      try {
        const stream = await openCameraStream(deviceId);
        setPermission("granted");
        await attachStream(stream);
        await refreshDevices();
      } catch (cause) {
        const mapped = mapCameraError(cause);
        setPermission(mapped.permission);
        setError(mapped.message);
        setReady(false);
      }
    },
    [attachStream, refreshDevices, stopCamera],
  );

  const switchCamera = useCallback(
    async (deviceId: string) => {
      if (deviceId === activeDeviceId) {
        return;
      }

      await startCamera(deviceId);
    },
    [activeDeviceId, startCamera],
  );

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    ready,
    permission,
    error,
    devices,
    activeDeviceId,
    startCamera,
    switchCamera,
    stopCamera,
  };
}
