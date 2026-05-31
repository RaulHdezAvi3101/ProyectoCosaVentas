export type CameraPlatform = "ios" | "android" | "desktop";

export function detectCameraPlatform(): CameraPlatform {
  if (typeof navigator === "undefined") {
    return "desktop";
  }

  const ua = navigator.userAgent;

  if (/iPad|iPhone|iPod/.test(ua)) {
    return "ios";
  }

  if (/Android/.test(ua)) {
    return "android";
  }

  return "desktop";
}
