import { Button, Typography } from "@mui/material";
import { FC } from "react";
import { MdEdit } from "react-icons/md";

type Props = {
  title: string;
  onClickButton: () => void;
};

export const DetailsSectionHeader: FC<Props> = ({ title, onClickButton }) => {
  return (
    <div className="flex flex-1 flex-row items-center justify-between">
      <Typography variant="h6">{title}</Typography>
      <Button
        variant="outlined"
        endIcon={<MdEdit />}
        onClick={onClickButton}
        sx={{ textTransform: "none" }}
      >
        Edit
      </Button>
    </div>
  );
};
