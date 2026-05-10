import api from "@services/api";

/**
 * Normalizes stored document/path to the upload filename used by the API.
 */
export function normalizeUploadFileKey(documentOrKey: string): string {
  const trimmed = documentOrKey.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const pathPart = trimmed.split("?")[0] ?? trimmed;
    const idx = pathPart.indexOf("/uploads/");
    if (idx === -1) return pathPart.split("/").pop() ?? pathPart;
    return pathPart.slice(idx + "/uploads/".length);
  }
  let key = trimmed;
  if (key.includes("/uploads/")) {
    key = key.split("/uploads/").pop()?.split("?")[0] ?? key;
  }
  return key;
}

/**
 * @deprecated Prefer `fetchUploadFileBlob` / authenticated URLs — public `/uploads` is no longer served.
 */
export function getPublicUploadsFileUrl(documentOrKey: string): string {
  const key = normalizeUploadFileKey(documentOrKey);
  const base = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5050"
  ).replace(/\/$/, "");
  return `${base}/api/v1/files/${encodeURIComponent(key)}`;
}

export async function fetchUploadFileBlob(documentOrKey: string): Promise<Blob> {
  const key = normalizeUploadFileKey(documentOrKey);
  if (!key || key.includes("..")) {
    throw new Error("Invalid file key");
  }
  const response = await api.get(`/files/${encodeURIComponent(key)}`, {
    responseType: "blob",
  });
  return response.data;
}

export async function createUploadObjectUrl(
  documentOrKey: string
): Promise<string> {
  const blob = await fetchUploadFileBlob(documentOrKey);
  return URL.createObjectURL(blob);
}
