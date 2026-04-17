import { FC } from "react";

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@components/ui/skeleton";

export const RentalItemSkeleton: FC = () => (
  <TableRow className="border-b border-slate-100 hover:bg-transparent">
    <TableCell className="py-3 pl-6">
      <Skeleton className="h-4 w-40" />
    </TableCell>
    <TableCell className="py-3">
      <Skeleton className="h-4 w-36" />
    </TableCell>
    <TableCell className="py-3">
      <Skeleton className="h-5 w-16 rounded-md" />
    </TableCell>
    <TableCell className="py-3 pr-6">
      <div className="flex items-center justify-end gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </TableCell>
  </TableRow>
);
