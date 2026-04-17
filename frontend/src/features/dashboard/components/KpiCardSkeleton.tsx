import { FC } from "react";

import { Card, CardContent, CardHeader } from "@components/ui/card";
import { Skeleton } from "@components/ui/skeleton";

export const KpiCardSkeleton: FC = () => (
  <Card className="flex-1 min-w-[220px]">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-9 rounded-lg" />
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <Skeleton className="h-8 w-32" />
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-36" />
      </div>
    </CardContent>
  </Card>
);
