// A minimal offline queue for pickup completions. Collectors work in areas
// with patchy coverage — if the network is down when they tap "Complete",
// the action (photo, GPS, bin count) is queued locally and retried when
// connectivity returns, rather than silently lost.

export interface PendingCompletion {
  pickupId: string;
  photoBase64: string | null;
  latitude: number | null;
  longitude: number | null;
  binCount: number | null;
  queuedAt: string;
}

const KEY = "dwms_pending_completions";

export function getQueue(): PendingCompletion[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function saveQueue(q: PendingCompletion[]) {
  localStorage.setItem(KEY, JSON.stringify(q));
}

export function enqueueCompletion(item: PendingCompletion) {
  const q = getQueue();
  q.push(item);
  saveQueue(q);
}

export function removeFromQueue(pickupId: string) {
  saveQueue(getQueue().filter((i) => i.pickupId !== pickupId));
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(dataUrl: string): Blob {
  const [meta, base64] = dataUrl.split(",");
  const mime = meta.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export function isNetworkError(err: unknown): boolean {
  const e = err as { code?: string; message?: string; response?: unknown };
  return !e?.response && (e?.code === "ERR_NETWORK" || (typeof window !== "undefined" && !window.navigator.onLine));
}
