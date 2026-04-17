import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import {
  MdApartment,
  MdPeople,
  MdTrendingUp,
  MdWarningAmber,
} from "react-icons/md";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { ApartmentType } from "@features/apartments/types/apartment.type";
import {
  DashboardResponse,
  ExpiringLeasesWidget,
  KpiCard,
  UpcomingPaymentsWidget,
} from "@features/dashboard";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

export const HomeScreen = () => {
  const {
    data: dashboard,
    isLoading: isDashboardLoading,
    isError: isDashboardError,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const result = await api.get<DashboardResponse>("/dashboard");
      return result.data;
    },
  });

  const {
    data: apartments,
    isLoading: isApartmentsLoading,
    isError: isApartmentsError,
  } = useQuery({
    queryKey: ["apartments", "list"],
    queryFn: async () => {
      const result = await api.get<ApartmentType[]>("/apartments");
      return result.data;
    },
  });

  const apartmentsById = useMemo(() => {
    if (!apartments) return {};
    return apartments.reduce<Record<string, { _id: string; address: string }>>(
      (acc, apartment) => {
        acc[apartment._id] = { _id: apartment._id, address: apartment.address };
        return acc;
      },
      {}
    );
  }, [apartments]);

  if (isDashboardLoading || isApartmentsLoading) return <LoadingView />;
  if (isDashboardError || !dashboard || isApartmentsError)
    return (
      <ErrorView
        message={dashboardError?.message ?? "Unable to load dashboard"}
        onClick={refetchDashboard}
      />
    );

  const { kpi, upcomingPayments, expiringLeases } = dashboard;

  return (
    <RouteContent>
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            Dashboard
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Overview of your rental portfolio
          </Typography>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-6 p-8">
        <div className="flex flex-row flex-wrap gap-4">
          <KpiCard
            title="Apartments"
            value={kpi.apartmentsCount}
            subtitle={`${kpi.occupiedCount} occupied · ${
              kpi.apartmentsCount - kpi.occupiedCount
            } available`}
            icon={<MdApartment size={24} />}
          />
          <KpiCard
            title="Occupancy"
            value={`${kpi.occupancyRate}%`}
            subtitle={`${kpi.activeRentalsCount} active rentals`}
            accentClassName={
              kpi.occupancyRate >= 75
                ? "text-green-700"
                : kpi.occupancyRate >= 50
                ? "text-amber-700"
                : "text-gray-900"
            }
            icon={<MdPeople size={24} />}
          />
          <KpiCard
            title="MRR"
            value={formatCurrency(kpi.mrr)}
            subtitle="Monthly recurring revenue (active rentals)"
            accentClassName="text-green-700"
            icon={<MdTrendingUp size={24} />}
          />
          <KpiCard
            title="Overdue"
            value={formatCurrency(kpi.overdueAmount)}
            subtitle={`${kpi.overdueCount} overdue invoices`}
            accentClassName={
              kpi.overdueAmount > 0 ? "text-red-700" : "text-gray-900"
            }
            icon={<MdWarningAmber size={24} />}
          />
        </div>

        <UpcomingPaymentsWidget
          payments={upcomingPayments}
          apartmentsById={apartmentsById}
        />

        <ExpiringLeasesWidget
          leases={expiringLeases}
          apartmentsById={apartmentsById}
        />
      </main>
    </RouteContent>
  );
};
