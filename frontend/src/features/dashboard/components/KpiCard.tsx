import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";

type Props = {
  title: string;
  value: ReactNode;
  subtitle?: ReactNode;
  valueClassName?: string;
  iconClassName?: string;
  icon?: ReactNode;
  headerRight?: ReactNode;
};

export const KpiCard: FC<Props> = ({
  title,
  value,
  subtitle,
  valueClassName,
  iconClassName,
  icon,
  headerRight,
}) => (
  <Card className="flex-1 min-w-[220px]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </CardTitle>
      {icon ? (
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground",
            iconClassName
          )}
        >
          {icon}
        </div>
      ) : null}
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <div
        className={cn(
          "text-3xl font-semibold tracking-tight text-slate-900",
          valueClassName
        )}
      >
        {value}
      </div>
      {subtitle || headerRight ? (
        <div className="flex items-center justify-between gap-2">
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : (
            <span />
          )}
          {headerRight}
        </div>
      ) : null}
    </CardContent>
  </Card>
);
