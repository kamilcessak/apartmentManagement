import { FC } from "react";

import { Skeleton } from "@components/ui/skeleton";
import { TableCell, TableRow } from "@components/ui/table";

export const ApartmentItemSkeleton: FC = () => (
  <TableRow className="border-b border-slate-100 hover:bg-transparent">
    <TableCell className="py-3 pl-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    </TableCell>

    <TableCell className="py-3">
      <Skeleton className="h-3 w-40" />
    </TableCell>

    <TableCell className="py-3">
      <Skeleton className="h-4 w-24" />
    </TableCell>

    <TableCell className="py-3">
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>

    <TableCell className="py-3 pr-6">
      <div className="flex justify-end">
        <Skeleton className="h-9 w-9 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);
