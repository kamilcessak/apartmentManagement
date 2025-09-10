import { FC, useState } from "react";
import { CircularProgress, Divider } from "@mui/material";

import { DetailsSectionHeader } from "./DetailsSectionHeader";

import { FileItem, UploadFileButton } from "@components/files";
import api from "@services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type Props = {
  photos: string[];
  handleRefreshGetApartment: () => void;
  id: string;
};

export const DetailsPhotosSection: FC<Props> = ({
  photos,
  id,
  handleRefreshGetApartment,
}) => {
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

  const handlePatchApartment = async (photo: string) => {
    try {
      const result = await api.patch(`/apartment/${id}`, {
        photos: [...photos, photo],
      });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleDeletePhotoFromApartment = async (photo: string) => {
    try {
      const result = await api.patch(`/apartment/${id}`, {
        photos: photos.filter((e) => e !== photo),
      });
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate: patchApartment, isPending: isApartmentPatching } =
    useMutation({
      mutationFn: handlePatchApartment,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
        toast("Successfully modified apartment details", { type: "success" });
      },
      onError: () => {
        toast("An error occurred during modifying apartment details", {
          type: "error",
        });
      },
    });

  const { mutate: deletePhoto, isPending: isPhotoDeleting } = useMutation({
    mutationFn: handleDeletePhotoFromApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
      toast("Successfully deleted photo.", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting photo", {
        type: "error",
      });
    },
  });

  const { mutate: uploadFile, isPending: isFileUploading } = useMutation({
    mutationFn: handleUploadFile,
    onSuccess: ({ data }) => {
      toast("Successfully uploaded file", { type: "success" });
      console.log({ data });
      patchApartment(data.fileName);
    },
    onError: () =>
      toast("An error occurred during uploading file. Try again.", {
        type: "error",
      }),
  });

  return (
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        title={"Photos"}
        editMode={editMode}
        editModeButton={
          <UploadFileButton
            disabled={isFileUploading || isApartmentPatching}
            size="medium"
            startIcon={
              isFileUploading || isApartmentPatching ? (
                <CircularProgress />
              ) : null
            }
            callback={(file: File) => uploadFile(file)}
          />
        }
        onClickButton={() => seteditMode((prev) => !prev)}
      />
      <Divider />
      <div className="flex flex-row flex-wrap gap-4">
        {photos.map((e, i) => (
          <FileItem
            key={`photo-file-${e}-${i}`}
            name={e}
            fileName={e}
            isPhoto={e.includes("png") || e.includes("jpg")}
            isDocument={e.includes("pdf")}
            containerStyle={{ flex: "0 0 calc(25% - 12px)" }}
            editMode={editMode}
            onSuccess={() => {
              deletePhoto(e);
            }}
            isPending={isPhotoDeleting}
          />
        ))}
      </div>
    </section>
  );
};
