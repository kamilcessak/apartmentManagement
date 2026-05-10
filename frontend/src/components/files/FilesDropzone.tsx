import { FC, useCallback, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  FileText,
  ImageIcon,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";

import api from "@services/api";
import { cn } from "@/lib/utils";

export type DropzoneFileType = {
  name: string;
  type: string;
  fileName?: string;
  url?: string;
};

type Props = {
  title: string;
  dropzoneTitle: string;
  dropzoneHint?: string;
  uploadingLabel?: string;
  /** One file uploaded successfully (single selection) */
  uploadSuccessSingle: string;
  /** Multiple files uploaded successfully in one action */
  uploadSuccessBatch: string;
  uploadError: string;
  handleAddForm: (url: string) => void;
  handleRemoveForm: (url: string) => void;
  accept?: string;
  disabled?: boolean;
};

export const FilesDropzone: FC<Props> = ({
  title,
  dropzoneTitle,
  dropzoneHint,
  uploadingLabel = "Uploading...",
  uploadSuccessSingle,
  uploadSuccessBatch,
  uploadError,
  handleAddForm,
  handleRemoveForm,
  accept,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<DropzoneFileType[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const uploadLocked = disabled || isUploading;

  const handleFilesSelected = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || uploadLocked) return;
      const queue = Array.from(fileList);
      if (queue.length === 0) return;

      setIsUploading(true);
      setUploadProgress(0);

      setFiles((prev) => [
        ...prev,
        ...queue.map((f) => ({ name: f.name, type: f.type })),
      ]);

      let failureCount = 0;

      for (const file of queue) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const { data } = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: (progressEvent) => {
              if (!progressEvent.total) return;
              const progress = Math.round(
                (progressEvent.loaded / progressEvent.total) * 100
              );
              setUploadProgress(progress);
            },
          });

          const { fileName, url, originalName } = data;
          const matchName = originalName ?? file.name;

          handleAddForm(fileName);
          setFiles((prev) =>
            prev.map((e) =>
              e.name === matchName ? { ...e, fileName, url } : e
            )
          );
        } catch {
          failureCount += 1;
          setFiles((prev) => prev.filter((e) => e.name !== file.name));
        }
      }

      setUploadProgress(0);
      setIsUploading(false);

      const okCount = queue.length - failureCount;

      if (okCount === queue.length && queue.length > 0) {
        toast(queue.length === 1 ? uploadSuccessSingle : uploadSuccessBatch, {
          type: "success",
        });
      } else if (failureCount > 0) {
        toast(uploadError, { type: "error" });
      }
    },
    [
      uploadLocked,
      handleAddForm,
      uploadSuccessSingle,
      uploadSuccessBatch,
      uploadError,
    ]
  );

  const handleClick = () => {
    if (uploadLocked) return;
    inputRef.current?.click();
  };

  const handleRemove = (file: DropzoneFileType) => {
    if (file.fileName) handleRemoveForm(file.fileName);
    setFiles((prev) => prev.filter((e) => e.name !== file.name));
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-slate-900">{title}</p>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!uploadLocked) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFilesSelected(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-200 bg-white p-8 text-center transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragging && "border-primary bg-primary/5",
          uploadLocked && "cursor-not-allowed opacity-60"
        )}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">{dropzoneTitle}</p>
        {dropzoneHint ? (
          <p className="text-xs text-slate-500">{dropzoneHint}</p>
        ) : null}
        {isUploading ? (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>
              {uploadingLabel}
              {uploadProgress > 0 ? ` ${uploadProgress}%` : ""}
            </span>
          </div>
        ) : null}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          disabled={uploadLocked}
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length ? (
        <ul className="flex flex-col gap-2">
          {files.map((file, index) => {
            const isImage = file.type.includes("image");
            const isUploadingRow = !file.fileName;
            return (
              <li
                key={`${title}-${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    {isImage ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {file.name}
                    </p>
                    {isUploadingRow ? (
                      <div className="mt-1 h-1 w-32 overflow-hidden rounded bg-slate-100">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        {file.type || "file"}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(file);
                  }}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
