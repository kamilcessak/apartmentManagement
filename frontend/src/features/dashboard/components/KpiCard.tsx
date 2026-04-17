import { FC, ReactNode } from "react";
import { Paper, Typography } from "@mui/material";

type Props = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  accentClassName?: string;
  icon?: ReactNode;
};

export const KpiCard: FC<Props> = ({
  title,
  value,
  subtitle,
  accentClassName,
  icon,
}) => (
  <Paper
    elevation={0}
    className="flex flex-1 flex-col gap-2 p-4 border-2 border-gray-200 rounded-md min-w-[200px]"
  >
    <div className="flex flex-row items-center justify-between">
      <Typography variant="caption" className="text-gray-600 uppercase">
        {title}
      </Typography>
      {icon ? <div className="text-gray-500">{icon}</div> : null}
    </div>
    <Typography
      variant="h4"
      className={`font-semibold ${accentClassName ?? ""}`}
    >
      {value}
    </Typography>
    {subtitle ? (
      <Typography variant="body2" className="text-gray-500">
        {subtitle}
      </Typography>
    ) : null}
  </Paper>
);
