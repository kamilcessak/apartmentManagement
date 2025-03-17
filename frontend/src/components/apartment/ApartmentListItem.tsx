import { Typography } from "@mui/material";
import { FC, ReactNode } from "react";

type Props = {
  title?: string;
  flex: number;
  content?: ReactNode;
  isFirst?: boolean;
};

export const ApartmentListItem: FC<Props> = ({
  title,
  flex,
  content,
  isFirst,
}) => (
  <div
    className="flex border-gray-200"
    style={{
      flex,
      paddingLeft: isFirst ? 0 : 8,
      overflow: "hidden",
      minWidth: 0,
    }}
  >
    {title ? (
      <Typography
        noWrap
        variant="body1"
        color="gray"
        style={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </Typography>
    ) : null}
    {content ? content : null}
  </div>
);
