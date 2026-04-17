import { FC } from "react";

import { RouteContent } from "@components/common";
import { Skeleton } from "@components/ui/skeleton";

import { KpiCardSkeleton } from "./KpiCardSkeleton";
import { UpcomingPaymentsWidgetSkeleton } from "./UpcomingPaymentsWidgetSkeleton";
import { ExpiringLeasesWidgetSkeleton } from "./ExpiringLeasesWidgetSkeleton";

export const DashboardSkeleton: FC = () => (
  <RouteContent>
    <header
      className="flex items-center justify-between border-b border-slate-200 bg-background px-8 py-6"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
    </header>
    <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <KpiCardSkeleton key={`kpi-skeleton-${index}`} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <UpcomingPaymentsWidgetSkeleton />
        </div>
        <div className="xl:col-span-2">
          <ExpiringLeasesWidgetSkeleton />
        </div>
      </section>
    </main>
  </RouteContent>
);
