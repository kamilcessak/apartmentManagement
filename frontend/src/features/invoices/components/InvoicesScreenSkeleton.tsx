import { FC } from "react";

import { RouteContent } from "@components/common";
import { Skeleton } from "@components/ui/skeleton";

import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  rows?: number;
};

export const InvoicesScreenSkeleton: FC<Props> = ({ rows = 6 }) => (
  <RouteContent>
    <main
      className="flex h-full flex-col gap-6 overflow-y-auto bg-slate-50 p-8 scrollbar-hide"
      aria-busy="true"
      aria-live="polite"
    >
      <header className="mb-6 flex flex-row items-start justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-md" />
      </header>

      <Card className="p-6">
        <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Skeleton className="h-10 w-full lg:max-w-sm" />

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Skeleton className="h-10 w-full sm:w-[200px]" />
            <Skeleton className="h-10 w-full sm:w-[160px]" />
            <Skeleton className="h-10 w-full sm:w-[320px]" />
          </div>
        </section>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-20" />
                </TableHead>
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-24" />
                </TableHead>
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-12" />
                </TableHead>
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-16" />
                </TableHead>
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-20" />
                </TableHead>
                <TableHead className="px-4">
                  <Skeleton className="h-3 w-16" />
                </TableHead>
                <TableHead className="px-4 text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-3 w-14" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, index) => (
                <TableRow key={`invoice-row-skeleton-${index}`}>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex flex-row items-center justify-end gap-1">
                      <Skeleton className="h-9 w-9 rounded-md" />
                      <Skeleton className="h-9 w-9 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </main>
  </RouteContent>
);
