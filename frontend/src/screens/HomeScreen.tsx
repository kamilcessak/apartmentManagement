import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  Building2,
  FileText,
  ReceiptText,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { Badge } from "@components/ui/badge";
import { Card, CardContent } from "@components/ui/card";
import api from "@services/api";
import { ApartmentType } from "@features/apartments/types/apartment.type";
import { RentalType } from "@features/rentals/types/rental.types";
import { TenantsListType } from "@features/tenants/types/tenant.type";
import {
  DashboardResponse,
  DashboardSkeleton,
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
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  const displayName =
    user?.firstName ||
    user?.tenant?.firstName ||
    user?.email?.split("@")[0] ||
    t("dashboard.tenantHome.defaultName");

  const tiles = [
    {
      to: "/my-apartment",
      title: t("dashboard.tenantHome.myApartmentTitle"),
      description: t("dashboard.tenantHome.myApartmentDescription"),
      icon: Building2,
    },
    {
      to: "/my-invoices",
      title: t("dashboard.tenantHome.myInvoicesTitle"),
      description: t("dashboard.tenantHome.myInvoicesDescription"),
      icon: ReceiptText,
    },
    {
      to: "/my-documents",
      title: t("dashboard.tenantHome.myDocumentsTitle"),
      description: t("dashboard.tenantHome.myDocumentsDescription"),
      icon: FileText,
    },
  ];

  return (
    <RouteContent>
      <header className="border-b border-slate-200 bg-background px-8 py-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {t("dashboard.tenantHome.welcome", { name: displayName })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dashboard.tenantHome.subtitle")}
        </p>
      </header>
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {tiles.map(({ to, title, description, icon: Icon }) => (
            <Link key={to} to={to} className="no-underline">
              <Card className="h-full transition-colors hover:border-primary/60 hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </RouteContent>
  );
};

const LandlordHome = () => {
  const { t } = useTranslation();
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

  const { data: tenantsList } = useQuery({
    queryKey: ["tenants", "list"],
    queryFn: async () => {
      const result = await api.get<TenantsListType[]>("/tenantsList");
      return result.data;
    },
  });

  const { data: rentals } = useQuery({
    queryKey: ["rentals", "list"],
    queryFn: async () => {
      const result = await api.get<RentalType[]>("/rentals");
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

  const tenantsById = useMemo(() => {
    if (!tenantsList) return {};
    return tenantsList.reduce<
      Record<string, { firstName: string; lastName: string }>
    >((acc, tenant) => {
      acc[tenant._id] = { firstName: tenant.firstName, lastName: tenant.lastName };
      return acc;
    }, {});
  }, [tenantsList]);

  const tenantByApartmentId = useMemo(() => {
    if (!rentals || !tenantsList) return {};
    const activeRentals = rentals.filter((r) => r.isActive);
    return activeRentals.reduce<
      Record<string, { firstName: string; lastName: string }>
    >((acc, rental) => {
      const tenant = tenantsById[rental.tenantID];
      if (tenant && !acc[rental.apartmentID]) {
        acc[rental.apartmentID] = tenant;
      }
      return acc;
    }, {});
  }, [rentals, tenantsList, tenantsById]);

  if (isDashboardLoading || isApartmentsLoading) return <DashboardSkeleton />;
  if (isDashboardError || !dashboard || isApartmentsError)
    return (
      <ErrorView
        message={
          dashboardError?.message ?? t("dashboard.errorFallback")
        }
        onClick={refetchDashboard}
      />
    );

  const { kpi, upcomingPayments, expiringLeases } = dashboard;
  const availableCount = Math.max(kpi.apartmentsCount - kpi.occupiedCount, 0);

  return (
    <RouteContent>
      <header className="flex items-center justify-between border-b border-slate-200 bg-background px-8 py-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("dashboard.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.subtitle")}
          </p>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title={t("dashboard.kpi.apartments.title")}
            value={kpi.apartmentsCount}
            subtitle={t("dashboard.kpi.apartments.subtitle", {
              occupied: kpi.occupiedCount,
              available: availableCount,
            })}
            icon={<Building2 className="h-[18px] w-[18px]" />}
            iconClassName="bg-primary/10 text-primary"
          />
          <KpiCard
            title={t("dashboard.kpi.occupancy.title")}
            value={`${kpi.occupancyRate}%`}
            subtitle={t("dashboard.kpi.occupancy.subtitle", {
              count: kpi.activeRentalsCount,
            })}
            icon={<Users className="h-[18px] w-[18px]" />}
            iconClassName="bg-primary/10 text-primary"
            valueClassName={
              kpi.occupancyRate >= 75
                ? "text-success"
                : kpi.occupancyRate >= 50
                ? "text-warning"
                : "text-slate-900"
            }
          />
          <KpiCard
            title={t("dashboard.kpi.mrr.title")}
            value={formatCurrency(kpi.mrr)}
            subtitle={t("dashboard.kpi.mrr.subtitle")}
            icon={<TrendingUp className="h-[18px] w-[18px]" />}
            iconClassName="bg-success/10 text-success"
            valueClassName="text-success"
          />
          <KpiCard
            title={t("dashboard.kpi.overdue.title")}
            value={formatCurrency(kpi.overdueAmount)}
            subtitle={t("dashboard.kpi.overdue.subtitle", {
              count: kpi.overdueCount,
            })}
            icon={<AlertTriangle className="h-[18px] w-[18px]" />}
            iconClassName={
              kpi.overdueCount > 0
                ? "bg-destructive/10 text-destructive"
                : undefined
            }
            valueClassName={
              kpi.overdueAmount > 0 ? "text-destructive" : "text-slate-900"
            }
            headerRight={
              kpi.overdueCount > 0 ? (
                <Badge variant="destructive">
                  {t("dashboard.kpi.overdue.badge", {
                    count: kpi.overdueCount,
                  })}
                </Badge>
              ) : null
            }
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-5">
          <div className="xl:col-span-3">
            <UpcomingPaymentsWidget
              payments={upcomingPayments}
              apartmentsById={apartmentsById}
              tenantsById={tenantsById}
              tenantByApartmentId={tenantByApartmentId}
            />
          </div>
          <div className="xl:col-span-2">
            <ExpiringLeasesWidget
              leases={expiringLeases}
              apartmentsById={apartmentsById}
              tenantsById={tenantsById}
            />
          </div>
        </section>
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
