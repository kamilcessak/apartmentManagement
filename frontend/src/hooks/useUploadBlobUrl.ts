import { useEffect, useState } from "react";
import {
  createUploadObjectUrl,
  normalizeUploadFileKey,
} from "@utils/uploadsUrl";

/**
 * Resolves an upload reference to a blob URL (with Authorization) or passes through absolute http(s) URLs.
 */
export function useUploadBlobUrl(fileRef: string | undefined | null) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const trimmed = fileRef?.trim();
    if (!trimmed) {
      setUrl(null);
      setFailed(false);
      return;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setUrl(trimmed.split("?")[0] ?? trimmed);
      setFailed(false);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;
    setFailed(false);

    createUploadObjectUrl(trimmed)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
          setUrl(null);
        }
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileRef]);

  return { url, failed, displayKey: fileRef ? normalizeUploadFileKey(fileRef) : "" };
}
