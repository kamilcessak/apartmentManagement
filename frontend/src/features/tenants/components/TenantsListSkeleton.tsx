import { FC } from "react";

import { RouteContent } from "@components/common";
import { Skeleton } from "@components/ui/skeleton";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

import { TenantItemSkeleton } from "./TenantItemSkeleton";

type Props = {
  rows?: number;
};

export const TenantsListSkeleton: FC<Props> = ({ rows = 6 }) => (
  <RouteContent sectionStyle={{ flexDirection: "column" }}>
    <div
      className="flex h-full flex-col overflow-hidden bg-slate-50 p-6 lg:p-8"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 self-start rounded-md sm:self-auto" />
      </header>

      <div className="mt-6 flex flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 px-6 py-4">
          <Skeleton className="h-10 w-full max-w-sm rounded-md" />
        </div>

        <div className="flex-1 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="pl-6">
                  <Skeleton className="h-3 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-3 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-3 w-16" />
                </TableHead>
                <TableHead className="pr-6 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-3 w-16" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, index) => (
                <TenantItemSkeleton key={`tenant-row-skeleton-${index}`} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  </RouteContent>
);
