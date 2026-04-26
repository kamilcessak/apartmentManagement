import { FC, useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type FilePreviewVariant = "image" | "pdf" | "other";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string | null;
  fileName: string;
  variant: FilePreviewVariant;
  closeLabel: string;
  iframeTitle: string;
  documentPlaceholder: string;
  /** Shown when the preview URL could not be resolved */
  missingUrlMessage: string;
};

export const FilePreviewModal: FC<Props> = ({
  open,
  onClose,
  url,
  fileName,
  variant,
  closeLabel,
  iframeTitle,
  documentPlaceholder,
  missingUrlMessage,
}) => {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const node = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <div
        className="absolute inset-0 cursor-default bg-slate-900/60 backdrop-blur-[2px]"
        role="presentation"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-[101] flex max-h-[min(90vh,920px)] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-5">
          <h2
            id={titleId}
            className="min-w-0 pr-2 text-left text-base font-semibold leading-snug text-slate-900"
          >
            {fileName}
          </h2>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={closeLabel}
            onClick={onClose}
          >
            <X className="size-5" strokeWidth={2} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto bg-slate-50/80 p-4 sm:p-5">
          {!url ? (
            <p className="text-sm text-slate-600">{missingUrlMessage}</p>
          ) : variant === "image" ? (
            <div className="flex min-h-[min(60vh,480px)] items-center justify-center">
              <img
                src={url}
                alt={fileName}
                className="max-h-[min(75vh,720px)] w-full max-w-full object-contain"
              />
            </div>
          ) : variant === "pdf" ? (
            <iframe
              title={iframeTitle}
              src={url}
              className="h-[min(75vh,720px)] w-full rounded-lg border border-slate-200 bg-white shadow-sm"
            />
          ) : (
            <div className="flex min-h-[min(50vh,360px)] flex-col items-center justify-center gap-4 px-4 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-slate-200/80 text-slate-500">
                <FileText className="size-8" strokeWidth={1.25} />
              </div>
              <p className="max-w-md text-sm leading-relaxed text-slate-600">
                {documentPlaceholder}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
};
