import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import {
  MdApartment,
  MdPeople,
  MdTrendingUp,
  MdWarningAmber,
  MdDescription,
  MdReceiptLong,
} from "react-icons/md";
import { Link } from "react-router-dom";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { ApartmentType } from "@features/apartments/types/apartment.type";
import {
  DashboardResponse,
  ExpiringLeasesWidget,
  KpiCard,
  UpcomingPaymentsWidget,
} from "@features/dashboard";
import { useCurrentUser } from "../hooks";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

const TenantHome = () => {
  const { user } = useCurrentUser();
  const displayName =
    user?.firstName ||
    user?.tenant?.firstName ||
    user?.email?.split("@")[0] ||
    "there";

  return (
    <RouteContent>
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            Welcome, {displayName}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Quick access to what's assigned to your account
          </Typography>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/my-apartment" className="no-underline">
            <div className="border-2 border-gray-300 rounded-md p-6 flex flex-col gap-2 hover:border-blue-500 transition-colors">
              <MdApartment size={32} />
              <Typography variant="h6" className="font-semibold">
                My apartment
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                View the apartment assigned to your account
              </Typography>
            </div>
          </Link>
          <Link to="/my-invoices" className="no-underline">
            <div className="border-2 border-gray-300 rounded-md p-6 flex flex-col gap-2 hover:border-blue-500 transition-colors">
              <MdReceiptLong size={32} />
              <Typography variant="h6" className="font-semibold">
                My invoices
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Check payment status and due dates
              </Typography>
            </div>
          </Link>
          <Link to="/my-documents" className="no-underline">
            <div className="border-2 border-gray-300 rounded-md p-6 flex flex-col gap-2 hover:border-blue-500 transition-colors">
              <MdDescription size={32} />
              <Typography variant="h6" className="font-semibold">
                My documents
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Download contracts and invoice PDFs
              </Typography>
            </div>
          </Link>
        </div>
      </main>
    </RouteContent>
  );
};

const LandlordHome = () => {
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

export const HomeScreen = () => {
  const { isTenant, isLoading } = useCurrentUser();

  if (isLoading) return <LoadingView />;
  if (isTenant) return <TenantHome />;

  return <LandlordHome />;
};
