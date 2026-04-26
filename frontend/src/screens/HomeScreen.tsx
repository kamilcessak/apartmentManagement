import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Building2,
  FileText,
  Mail,
  Phone,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import dayjs from "dayjs";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Card, CardContent } from "@components/ui/card";
import api from "@services/api";
import { ApartmentType } from "@features/apartments/types/apartment.type";
import { getApartmentShortLabel } from "@utils/apartment";
import { RentalType } from "@features/rentals/types/rental.types";
import { TenantsListType } from "@features/tenants/types/tenant.type";
import {
  DashboardResponse,
  DashboardSkeleton,
  ExpiringLeasesWidget,
  KpiCard,
  UpcomingPaymentsWidget,
} from "@features/dashboard";
import {
  MyDocumentsResponse,
  MyInvoicesResponse,
} from "@features/tenant-portal/types";
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

  const { data: invoicesData } = useQuery<MyInvoicesResponse>({
    queryKey: ["me", "invoices"],
    queryFn: async () => {
      const result = await api.get<MyInvoicesResponse>("/me/invoices");
      return result.data;
    },
  });
  const { data: documentsData } = useQuery<MyDocumentsResponse>({
    queryKey: ["me", "documents"],
    queryFn: async () => {
      const result = await api.get<MyDocumentsResponse>("/me/documents");
      return result.data;
    },
  });

  const nextUnpaidInvoice = useMemo(() => {
    const invoices = invoicesData?.invoices ?? [];
    return invoices
      .filter((invoice) => !invoice.isPaid)
      .sort(
        (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()
      )[0];
  }, [invoicesData?.invoices]);

  const dueDateLabel = useMemo(() => {
    if (!nextUnpaidInvoice) return "";
    const dueDate = dayjs(nextUnpaidInvoice.dueDate);
    const daysLeft = dueDate.startOf("day").diff(dayjs().startOf("day"), "day");
    return t("dashboard.tenantHome.nextPayment.dueLabel", {
      date: dueDate.format("D MMMM YYYY"),
      days: Math.abs(daysLeft),
      context:
        daysLeft < 0 ? "overdue" : daysLeft === 0 ? "today" : "remaining",
    });
  }, [nextUnpaidInvoice, t]);

  const recentDocuments = useMemo(() => {
    if (!documentsData) {
      return [
        "Faktura_05_2026.pdf",
        "Umowa_Najmu.pdf",
        "Protokol_Zdawczo_Odbiorczy.pdf",
      ];
    }

    const documents = [
      ...documentsData.apartmentDocuments,
      ...documentsData.rentalDocuments,
      ...documentsData.invoiceDocuments
        .map((invoice) => invoice.document)
        .filter((document): document is string => Boolean(document)),
    ];

    if (documents.length === 0) {
      return ["Faktura_05_2026.pdf", "Umowa_Najmu.pdf"];
    }

    return documents.slice(0, 3);
  }, [documentsData]);

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
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <Wallet className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {t("dashboard.tenantHome.nextPayment.title")}
                </h2>
              </div>

              {nextUnpaidInvoice ? (
                <div className="mt-5 space-y-4">
                  <p className="text-4xl font-semibold tracking-tight text-slate-900">
                    {formatCurrency(nextUnpaidInvoice.amount)}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                    <CalendarDays className="h-4 w-4" />
                    <span>{dueDateLabel}</span>
                  </div>
                  <Button>{t("dashboard.tenantHome.nextPayment.primaryCta")}</Button>
                </div>
              ) : (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <p className="text-sm font-medium text-emerald-800">
                    {t("dashboard.tenantHome.nextPayment.paidState")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("dashboard.tenantHome.landlordContact.title")}
              </h2>
              <div className="mt-5 space-y-3">
                <p className="text-base font-semibold text-slate-900">
                  {t("dashboard.tenantHome.landlordContact.name")}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>{t("dashboard.tenantHome.landlordContact.phone")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{t("dashboard.tenantHome.landlordContact.email")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("dashboard.tenantHome.recentDocuments.title")}
                  </h2>
                </div>
                <Button variant="link" className="h-auto p-0 text-sm text-slate-500">
                  {t("dashboard.tenantHome.recentDocuments.viewAll")}
                </Button>
              </div>

              <div className="mt-5 space-y-3">
                {recentDocuments.map((documentName) => (
                  <div
                    key={documentName}
                    className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800">
                        {documentName}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm">
                      {t("dashboard.tenantHome.recentDocuments.download")}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
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
    return apartments.reduce<
      Record<string, { _id: string; shortLabel: string }>
    >((acc, apartment) => {
      acc[apartment._id] = {
        _id: apartment._id,
        shortLabel: getApartmentShortLabel(apartment),
      };
      return acc;
    }, {});
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
          <div className="flex min-h-0 h-full flex-col xl:col-span-3">
            <UpcomingPaymentsWidget
              payments={upcomingPayments}
              apartmentsById={apartmentsById}
              tenantsById={tenantsById}
              tenantByApartmentId={tenantByApartmentId}
            />
          </div>
          <div className="flex min-h-0 h-full flex-col xl:col-span-2">
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
