import { CSSProperties, Dispatch, FC, SetStateAction } from "react";
import { CircularProgress, Typography, useTheme } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import {
  MdCameraAlt,
  MdDeleteOutline,
  MdDescription,
  MdVisibility,
} from "react-icons/md";
import api from "../../services/api";
import { FileType } from "./FilesSection";

type Props = {
  name: string;
  isPhoto?: boolean;
  isDocument?: boolean;
  uploadProgress?: number;
  setfiles?: Dispatch<SetStateAction<FileType[]>>;
  fileName?: string;
  handleRemoveForm?: (url: string) => void;
  containerStyle?: CSSProperties;
  editMode?: boolean;
  onSuccess?: () => void;
};

export const FileItem: FC<Props> = ({
  name,
  isPhoto,
  isDocument,
  uploadProgress = 100,
  setfiles,
  fileName,
  handleRemoveForm,
  containerStyle,
  editMode,
  onSuccess,
}) => {
  const theme = useTheme();

  const handleGetFileToPreview = async () => {
    const response = await api.get(`/upload/${fileName}`);
    return response;
  };

  const handleDeleteFile = async () => {
    const response = await api.delete(`/upload/${fileName}`);
    return response;
  };

  const { mutate: previewFile, isPending: isPreviewFilePending } = useMutation({
    mutationFn: handleGetFileToPreview,
    onSuccess: (data) => {
      window.open(`http://localhost:5050${data.data.fileUrl}`, "_blank");
    },
  });

  const { mutate: deleteFile, isPending: isDeleteFilePending } = useMutation({
    mutationFn: handleDeleteFile,
    onSuccess: async () => {
      if (handleRemoveForm) await handleRemoveForm(`${fileName}`);
      if (setfiles) setfiles((prev) => prev.filter((e) => e.name !== name));
      if (onSuccess) onSuccess();
    },
  });

  return (
    <div
      className="flex flex-col items-center border-gray-400 p-4 rounded-md gap-2"
      style={{
        borderWidth: 1,
        overflow: "hidden",
        flex: "0 0 calc(33.333% - 11px)",
        ...containerStyle,
      }}
    >
      {isPhoto ? <MdCameraAlt size={64} /> : null}
      {isDocument ? <MdDescription size={64} /> : null}
      <Typography
        variant="body2"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
        }}
      >
        {name}
      </Typography>
      {uploadProgress < 100 ? (
        <div
          style={{
            width: `${uploadProgress}%`,
            height: 16,
            backgroundColor: theme.palette.success.main,
          }}
        />
      ) : (
        <div
          className={`flex w-full flex-row items-center ${
            editMode ? "justify-between" : "justify-center"
          }`}
        >
          {!editMode ? null : isDeleteFilePending ? (
            <CircularProgress size={24} />
          ) : (
            <MdDeleteOutline
              size={24}
              color={theme.palette.warning.main}
              onClick={() => deleteFile()}
            />
          )}
          {isPreviewFilePending ? (
            <CircularProgress size={24} />
          ) : (
            <MdVisibility size={24} onClick={() => previewFile()} />
          )}
        </div>
      )}
    </div>
  );
};
