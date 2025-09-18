import { FC, useState } from "react";
import { CircularProgress, Divider } from "@mui/material";

import { DetailsSectionHeader } from "@components/header";

import { FileItem, UploadFileButton } from "@components/files";
import api from "@services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type Props = {
  files: string[];
  id: string;
  type: "documents" | "photos";
  title: string;
};

export const DetailsFilesSection: FC<Props> = ({ files, id, type, title }) => {
  const queryClient = useQueryClient();
  const [editMode, seteditMode] = useState(false);

  const handleUploadFile = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handlePatchRental = async (file: string) => {
    try {
      const resultFiles = [...files, file];
      const data =
        type === "documents"
          ? { documents: resultFiles }
          : { photos: resultFiles };
      const result = await api.patch(`/rental/${id}`, data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeleteFileFromRental = async (file: string) => {
    try {
      const resultFiles = files.filter((e) => e !== file);
      const data =
        type === "documents"
          ? { photos: resultFiles }
          : { photos: resultFiles };
      const result = await api.patch(`/rental/${id}`, data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate: patchRental, isPending: isRentalPatching } = useMutation({
    mutationFn: handlePatchRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${id}`] });
      toast("Successfully modified rental details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying rental details", {
        type: "error",
      });
    },
  });

  const { mutate: deleteFile, isPending: isFileDeleting } = useMutation({
    mutationFn: handleDeleteFileFromRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${id}`] });
      toast("Successfully deleted file.", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting file", {
        type: "error",
      });
    },
  });

  const { mutate: uploadFile, isPending: isFileUploading } = useMutation({
    mutationFn: handleUploadFile,
    onSuccess: ({ data }) => {
      toast("Successfully uploaded file", { type: "success" });
      patchRental(data.fileName);
    },
    onError: () =>
      toast("An error occurred during uploading file. Try again.", {
        type: "error",
      }),
  });

  if (!files?.length) return null;

  return (
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        title={title}
        editMode={editMode}
        editModeButton={
          <UploadFileButton
            disabled={isFileUploading || isRentalPatching}
            size="medium"
            startIcon={
              isFileUploading || isRentalPatching ? <CircularProgress /> : null
            }
            callback={(file: File) => uploadFile(file)}
          />
        }
        onClickButton={() => seteditMode((prev) => !prev)}
      />
      <Divider />
      <div className="flex flex-row flex-wrap gap-4">
        {files.map((e, i) => (
          <FileItem
            key={`file-${e}-${i}`}
            name={e}
            fileName={e}
            isPhoto={e.includes("png") || e.includes("jpg")}
            isDocument={e.includes("pdf")}
            containerStyle={{ flex: "0 0 calc(25% - 12px)" }}
            editMode={editMode}
            onSuccess={() => {
              deleteFile(e);
            }}
            isPending={isFileDeleting}
          />
        ))}
      </div>
    </section>
  );
};
