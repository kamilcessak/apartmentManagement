import { Button, Typography } from "@mui/material";
import { FC } from "react";
import { MdClose, MdEdit } from "react-icons/md";
import { UploadFileButton } from "../../files";

type Props = {
  title: string;
  editMode?: boolean;
  onClickButton: () => void;
};

export const DetailsSectionHeader: FC<Props> = ({
  title,
  onClickButton,
  editMode,
}) => {
  return (
    <div className="flex flex-1 flex-row items-center justify-between">
      <Typography variant="h6">{title}</Typography>
      <div className="flex flex-row gap-2">
        {editMode ? (
          <UploadFileButton
            size="medium"
            callback={(file: File) => console.log(file)}
          />
        ) : null}
        <Button
          variant="outlined"
          endIcon={editMode ? <MdClose /> : <MdEdit />}
          onClick={onClickButton}
          sx={{ textTransform: "none" }}
        >
          {editMode ? "Close edit" : "Edit"}
        </Button>
      </div>
    </div>
  );
};
