import { FC } from "react";

import {
  Card,
  CardContent,
  CardHeader,
} from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

type Props = {
  rows?: number;
};

export const UpcomingPaymentsWidgetSkeleton: FC<Props> = ({ rows = 5 }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-6 w-20 rounded-md" />
    </CardHeader>
    <CardContent className="p-0">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <Skeleton className="h-3 w-20" />
        <div className="flex items-center gap-10">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <ul className="flex flex-col">
        {Array.from({ length: rows }).map((_, index) => (
          <li
            key={`upcoming-payment-skeleton-${index}`}
            className="flex items-center justify-between gap-4 border-b px-6 py-3 last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="hidden flex-1 px-6 md:block">
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-20" />
            <div className="flex flex-col items-end gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-16 rounded-md" />
            </div>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);
