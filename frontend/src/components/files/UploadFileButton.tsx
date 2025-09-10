import { Button } from "@mui/material";
import React from "react";
import { MdAdd } from "react-icons/md";

export const UploadFileButton = ({
  callback,
  size,
  startIcon,
  disabled,
}: {
  callback: (file: File) => void;
  size?: "small" | "medium" | "large";
  startIcon?: React.ReactNode;
  disabled: boolean;
}) => {
  return (
    <Button
      component="label"
      role={undefined}
      variant="outlined"
      color="success"
      disabled={disabled}
      size={size || "small"}
      tabIndex={-1}
      style={{ textTransform: "none" }}
      startIcon={startIcon ? startIcon : <MdAdd />}
    >
      Add
      <input
        style={{
          clip: "rect(0 0 0 0)",
          clipPath: "inset(50%)",
          height: 1,
          overflow: "hidden",
          position: "absolute",
          bottom: 0,
          left: 0,
          whiteSpace: "nowrap",
          width: 1,
        }}
        type="file"
        onChange={(event) => {
          if (event.target.files?.length) {
            callback(event.target.files[0]);
          }
        }}
      />
    </Button>
  );
};
