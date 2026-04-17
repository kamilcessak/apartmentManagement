import { FC } from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

type Props = {
  items?: number;
};

export const ExpiringLeasesWidgetSkeleton: FC<Props> = ({ items = 4 }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-6 w-24 rounded-md" />
    </CardHeader>
    <CardContent>
      <ul className="flex flex-col gap-3">
        {Array.from({ length: items }).map((_, index) => (
          <li key={`expiring-lease-skeleton-${index}`}>
            <div className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 border-l-4 border-l-slate-300 bg-slate-50/60 p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-20 rounded-md" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
