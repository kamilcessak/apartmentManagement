import { FC, useCallback, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
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
  handleAddForm,
  handleRemoveForm,
  accept,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<DropzoneFileType[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File) => {
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);
    setFiles((prev) => [...prev, { name: file.name, type: file.type }]);

    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) return;
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        setUploadProgress(progress);
      },
    });

    return { ...response, originalName: file.name };
  };

  const { mutate, isPending } = useMutation({
    mutationFn: uploadFile,
    onSuccess: ({ data, originalName }) => {
      const { originalName: serverOriginalName, fileName, url } = data;
      handleAddForm(fileName);
      setFiles((prev) =>
        prev.map((e) =>
          e.name === (serverOriginalName ?? originalName)
            ? { ...e, fileName, url }
            : e
        )
      );
      toast("Successfully uploaded file", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during uploading file. Try again.", {
        type: "error",
      });
    },
  });

  const handleFilesSelected = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || disabled) return;
      Array.from(fileList).forEach((file) => mutate(file));
    },
    [mutate, disabled]
  );

  const handleClick = () => {
    if (disabled) return;
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
          if (!disabled) setIsDragging(true);
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
          disabled && "cursor-not-allowed opacity-60"
        )}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-slate-400" />
        <p className="text-sm font-medium text-slate-700">{dropzoneTitle}</p>
        {dropzoneHint ? (
          <p className="text-xs text-slate-500">{dropzoneHint}</p>
        ) : null}
        {isPending ? (
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
          accept={accept}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handleFilesSelected(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {files.length ? (
        <ul className="flex flex-col gap-2">
          {files.map((file) => {
            const isImage = file.type.includes("image");
            const isUploading = !file.fileName;
            return (
              <li
                key={`${title}-${file.name}`}
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
                    {isUploading ? (
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
