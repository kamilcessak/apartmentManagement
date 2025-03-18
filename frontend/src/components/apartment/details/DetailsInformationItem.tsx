import { Typography } from "@mui/material";
import { FC, ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  content?: ReactNode;
};

export const DetailsInformationItem: FC<Props> = ({
  title,
  subtitle,
  content,
}) => (
  <div>
    <Typography variant="body2" color="gray">
      {title}
    </Typography>
    {content ? (
      content
    ) : (
      <Typography
        variant="body1"
        sx={{
          maxWidth: 400,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {subtitle}
      </Typography>
    )}
  </div>
);
