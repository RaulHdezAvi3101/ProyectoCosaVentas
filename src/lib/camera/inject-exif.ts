import piexif from "piexifjs";

function formatExifDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return (
    `${date.getFullYear()}:${pad(date.getMonth() + 1)}:${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new Blob([bytes], { type: mime });
}

/**
 * Inserta DateTimeOriginal en JPEG capturado desde canvas (sin EXIF nativo).
 */
export async function injectCaptureExif(blob: Blob, capturedAt: Date): Promise<Blob> {
  const dataUrl = await blobToDataUrl(blob);
  const exifDate = formatExifDate(capturedAt);

  const exifObj = {
    "0th": {
      [piexif.ImageIFD.DateTime]: exifDate,
    },
    Exif: {
      [piexif.ExifIFD.DateTimeOriginal]: exifDate,
      [piexif.ExifIFD.DateTimeDigitized]: exifDate,
    },
  };

  const exifBytes = piexif.dump(exifObj);
  const withExif = piexif.insert(exifBytes, dataUrl);
  return dataUrlToBlob(withExif);
}
