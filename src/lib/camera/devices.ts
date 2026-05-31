export interface VideoInputDevice {
  deviceId: string;
  label: string;
}

export async function listVideoInputDevices(): Promise<VideoInputDevice[]> {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return [];
  }

  const devices = await navigator.mediaDevices.enumerateDevices();

  return devices
    .filter((device) => device.kind === "videoinput")
    .map((device, index) => ({
      deviceId: device.deviceId,
      label: device.label || `Cámara ${index + 1}`,
    }));
}
