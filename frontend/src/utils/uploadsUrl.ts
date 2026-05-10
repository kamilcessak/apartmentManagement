/**
 * Public URL for a file under backend `/uploads` (no JWT; matches express.static).
 */
export function getPublicUploadsFileUrl(documentOrKey: string): string {
  const trimmed = documentOrKey.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.split("?")[0] ?? trimmed;
  }
  let key = trimmed;
  if (key.includes("/uploads/")) {
    key = key.split("/uploads/").pop()?.split("?")[0] ?? key;
  }
  const base = (
    import.meta.env.VITE_API_URL ?? "http://localhost:5050"
  ).replace(/\/$/, "");
  return `${base}/uploads/${encodeURIComponent(key)}`;
}
