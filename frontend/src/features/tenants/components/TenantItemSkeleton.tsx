import { FC } from "react";

import { Skeleton } from "@components/ui/skeleton";
import { TableCell, TableRow } from "@components/ui/table";

export const TenantItemSkeleton: FC = () => (
  <TableRow className="hover:bg-transparent">
    <TableCell className="py-3 pl-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-40" />
      </div>
    </TableCell>

    <TableCell className="py-3">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-sm" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </TableCell>

    <TableCell className="py-3">
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>

    <TableCell className="py-3 pr-6">
      <div className="flex justify-end">
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);
