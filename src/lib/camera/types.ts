export interface CapturedPhoto {
  id: string;
  previewUrl: string;
  blob: Blob;
  capturedAt: number;
  width: number;
  height: number;
}

export type CameraPermissionState = "unknown" | "granted" | "denied";
