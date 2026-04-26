import { FC, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Download,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";

import { DetailsSectionHeader } from "@components/header";
import { Button } from "@/components/ui/button";
import api from "@services/api";

import {
  FilePreviewModal,
  type FilePreviewVariant,
} from "./FilePreviewModal";

/** Strips leading `uuid-` prefix from multer-stored keys so UI shows the original filename. */
function getStoredFileDisplayName(storedKey: string): string {
  const uuidLen = 36;
  if (storedKey.length > uuidLen + 1 && storedKey[uuidLen] === "-") {
    return storedKey.slice(uuidLen + 1);
  }
  return storedKey;
}

function isLikelyImageFile(storedKey: string): boolean {
  const name = getStoredFileDisplayName(storedKey).toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(name);
}

function isPdfFile(storedKey: string): boolean {
  return /\.pdf$/i.test(getStoredFileDisplayName(storedKey));
}

function previewVariantForKey(fileKey: string): FilePreviewVariant {
  if (isLikelyImageFile(fileKey)) return "image";
  if (isPdfFile(fileKey)) return "pdf";
  return "other";
}

type Props = {
  files: string[];
  id: string;
  type: "documents" | "photos";
};

const ApartmentFileListRow: FC<{
  fileKey: string;
  section: "photos" | "documents";
  editMode: boolean;
  onPreview: () => void;
  onDownload: () => void;
  onRemove: () => void;
  viewLabel: string;
  downloadLabel: string;
  deleteLabel: string;
  isRemoving: boolean;
  isPreviewLoading: boolean;
  isDownloadLoading: boolean;
}> = ({
  fileKey,
  section,
  editMode,
  onPreview,
  onDownload,
  onRemove,
  viewLabel,
  downloadLabel,
  deleteLabel,
  isRemoving,
  isPreviewLoading,
  isDownloadLoading,
}) => {
  const displayName = getStoredFileDisplayName(fileKey);
  const pdf = isPdfFile(fileKey);
  const isPhotoSection = section === "photos";

  const iconWrapClass = isPhotoSection
    ? "text-sky-600 ring-slate-200/80"
    : pdf
      ? "text-blue-600 ring-slate-200/80"
      : "text-slate-500 ring-slate-200/80";

  return (
    <div className="flex flex-row items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-slate-50">
      <div
        className={`flex size-9 shrink-0 items-center justify-center rounded-md bg-white ring-1 ${iconWrapClass}`}
        aria-hidden
      >
        {isPhotoSection ? (
          <ImageIcon className="size-4" strokeWidth={1.75} />
        ) : (
          <FileText className="size-4" strokeWidth={1.75} />
        )}
      </div>
      <p
        className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800"
        title={displayName}
      >
        {displayName}
      </p>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1 sm:gap-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-slate-600"
          onClick={() => onPreview()}
          disabled={isPreviewLoading}
        >
          {isPreviewLoading ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : (
            <Eye className="size-3.5 shrink-0" strokeWidth={2} />
          )}
          <span>{viewLabel}</span>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-slate-600"
          onClick={() => onDownload()}
          disabled={isDownloadLoading}
        >
          {isDownloadLoading ? (
            <Loader2 className="size-3.5 shrink-0 animate-spin" />
          ) : (
            <Download className="size-3.5 shrink-0" strokeWidth={2} />
          )}
          <span>{downloadLabel}</span>
        </Button>
        {editMode ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
            aria-label={deleteLabel}
            onClick={() => onRemove()}
            disabled={isRemoving}
          >
            {isRemoving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
};

type PreviewState = {
  url: string;
  fileName: string;
  variant: FilePreviewVariant;
};

export const DetailsPhotosSection: FC<Props> = ({ files, id, type }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [previewLoadingKey, setPreviewLoadingKey] = useState<string | null>(
    null
  );

  const tk = (key: string) => t(`apartments.details.files.${key}`);

  const title =
    type === "photos" ? tk("photosTitle") : tk("documentsTitle");

  const fileList = files ?? [];

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const handlePatchApartment = async (file: string) => {
    const resultFiles = [...fileList, file];
    const data =
      type === "documents"
        ? { documents: resultFiles }
        : { photos: resultFiles };
    return api.patch(`/apartment/${id}`, data);
  };

  const handleDetachFile = async (file: string) => {
    const resultFiles = fileList.filter((e) => e !== file);
    const data =
      type === "documents"
        ? { documents: resultFiles }
        : { photos: resultFiles };
    return api.patch(`/apartment/${id}`, data);
  };

  const { mutate: patchApartment, isPending: isApartmentPatching } =
    useMutation({
      mutationFn: handlePatchApartment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
      },
      onError: () => {
        toast(tk("patchError"), { type: "error" });
      },
    });

  const {
    mutate: deleteUploadedFile,
    isPending: isDeletingUpload,
    variables: deleteTargetKey,
  } = useMutation({
    mutationFn: async (fileKey: string) => {
      await api.delete(`/upload/${fileKey}`);
      await handleDetachFile(fileKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
      toast(tk("deleteSuccess"), { type: "success" });
    },
    onError: () => {
      toast(tk("deleteError"), { type: "error" });
    },
  });

  const { mutate: uploadFile, isPending: isFileUploading } = useMutation({
    mutationFn: handleUploadFile,
    onSuccess: ({ data }) => {
      toast(tk("uploadSuccess"), { type: "success" });
      patchApartment(data.fileName);
    },
    onError: () => {
      toast(tk("uploadError"), { type: "error" });
    },
  });

  const {
    mutate: triggerDownload,
    isPending: isDownloadPending,
    variables: downloadTargetKey,
  } = useMutation({
    mutationFn: async (fileKey: string) => {
      const response = await api.get<{ url: string }>(
        `/upload/${fileKey}`
      );
      return {
        url: response.data.url,
        name: getStoredFileDisplayName(fileKey),
      };
    },
    onSuccess: ({ url, name }) => {
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
  });

  const openPreview = async (fileKey: string) => {
    setPreviewLoadingKey(fileKey);
    try {
      const response = await api.get<{ url: string }>(
        `/upload/${fileKey}`
      );
      setPreview({
        url: response.data.url,
        fileName: getStoredFileDisplayName(fileKey),
        variant: previewVariantForKey(fileKey),
      });
    } catch {
      toast(tk("previewOpenError"), { type: "error" });
    } finally {
      setPreviewLoadingKey(null);
    }
  };

  const closePreview = () => setPreview(null);

  const uploadBusy = isFileUploading || isApartmentPatching;

  const addFileControl = (
    <>
      <input
        ref={uploadInputRef}
        className="sr-only"
        type="file"
        accept={
          type === "photos"
            ? "image/jpeg,image/png,image/webp,image/gif"
            : "application/pdf,image/jpeg,image/png,image/webp,image/gif"
        }
        disabled={uploadBusy}
        onChange={(event) => {
          const f = event.target.files?.[0];
          if (f) uploadFile(f);
          event.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={uploadBusy}
        onClick={() => uploadInputRef.current?.click()}
      >
        {uploadBusy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Plus className="size-4" />
        )}
        {tk("addFile")}
      </Button>
    </>
  );

  const emptyMessage =
    type === "photos" ? tk("emptyPhotos") : tk("emptyDocuments");

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <FilePreviewModal
        open={preview !== null}
        onClose={closePreview}
        url={preview?.url ?? null}
        fileName={preview?.fileName ?? ""}
        variant={preview?.variant ?? "other"}
        closeLabel={tk("previewClose")}
        iframeTitle={tk("previewPdfFrameTitle")}
        documentPlaceholder={tk("previewDocumentPlaceholder")}
        missingUrlMessage={tk("previewOpenError")}
      />
      <DetailsSectionHeader
        title={title}
        editMode={editMode}
        editOpenLabel={tk("edit")}
        editCloseLabel={tk("closeEdit")}
        editModeButton={addFileControl}
        onClickButton={() => setEditMode((prev) => !prev)}
      />
      <div className="my-4 h-px w-full bg-slate-100" />

      {fileList.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {fileList.map((fileKey) => (
            <ApartmentFileListRow
              key={fileKey}
              fileKey={fileKey}
              section={type}
              editMode={editMode}
              viewLabel={tk("view")}
              downloadLabel={tk("download")}
              deleteLabel={tk("delete")}
              onPreview={() => openPreview(fileKey)}
              onDownload={() => triggerDownload(fileKey)}
              onRemove={() => deleteUploadedFile(fileKey)}
              isRemoving={
                isDeletingUpload && deleteTargetKey === fileKey
              }
              isPreviewLoading={previewLoadingKey === fileKey}
              isDownloadLoading={
                isDownloadPending && downloadTargetKey === fileKey
              }
            />
          ))}
        </div>
      )}
    </section>
  );
};
