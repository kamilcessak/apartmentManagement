import { Button, Typography } from "@mui/material";
import { MdAdd } from "react-icons/md";
import { FC, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { FileItem } from "./FileItem";
import api from "../../services/api";
import { UploadFileButton } from ".";

type Props = {
  title: string;
  handleAddForm: (url: string) => void;
  handleRemoveForm: (url: string) => void;
};

export type FileType = {
  name: string;
  type: string;
  fileName?: string;
  url?: string;
};

export const FilesSection: FC<Props> = ({
  title,
  handleAddForm,
  handleRemoveForm,
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setfiles] = useState<FileType[]>([]);

  const handleUploadFile = async (file: File) => {
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    setfiles((prev) => [...prev, { name: file.name, type: file.type }]);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent?.loaded / progressEvent.total) * 100
        );
        setUploadProgress(progress);
      },
    });
    return response;
  };

  const { mutate } = useMutation({
    mutationFn: handleUploadFile,
    onSuccess: ({ data: { originalName, fileName, url } }) => {
      handleAddForm(fileName);
      setfiles((prev) =>
        prev.map((e) =>
          e.name === originalName
            ? {
                ...e,
                fileName,
                url,
              }
            : e
        )
      );
    },
  });

  return (
    <section
      className="border-gray-600 p-4 rounded-sm"
      style={{ borderWidth: 1 }}
    >
      <div className="flex flex-1 flex-row items-center justify-between">
        <Typography variant="body1">{title}</Typography>
        <UploadFileButton callback={(file: File) => mutate(file)} />
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        {files.length
          ? files.map((e) => {
              return (
                <FileItem
                  {...e}
                  isPhoto={e.type.includes("jpeg") || e.type.includes("png")}
                  isDocument={e.type.includes("pdf")}
                  uploadProgress={uploadProgress}
                  setfiles={setfiles}
                  handleRemoveForm={handleRemoveForm}
                />
              );
            })
          : null}
      </div>
    </section>
  );
};
