import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Building2,
  Mail,
  Phone,
  Receipt,
  TrendingUp,
  Users,
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
import { TenantType } from "@features/tenants/types/tenant.type";
import {
  DashboardResponse,
  DashboardSkeleton,
  ExpiringLeasesWidget,
  KpiCard,
  UpcomingPaymentsWidget,
} from "@features/dashboard";
import { TenantTransferDetailsModal } from "@features/tenant-portal/components";
import {
  MyApartmentResponse,
  MyInvoicesResponse,
} from "@features/tenant-portal/types";
import { InvoiceType } from "@features/invoices/types";
import { getInvoiceTypeLabel } from "@features/invoices/utils/invoiceTypeLabel";
import { useCurrentUser } from "../hooks";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

function getNextRentPaymentDate(dayOfMonth: number, from: Date): Date {
  const candidate = new Date(
    from.getFullYear(),
    from.getMonth(),
    dayOfMonth
  );
  if (candidate < from) {
    candidate.setMonth(candidate.getMonth() + 1);
  }
  const daysInMonth = new Date(
    candidate.getFullYear(),
    candidate.getMonth() + 1,
    0
  ).getDate();
  if (candidate.getDate() > daysInMonth) {
    candidate.setDate(daysInMonth);
  }
  return candidate;
}

type UpcomingRow = {
  key: string;
  kind: "invoice" | "rent";
  label: string;
  typeLabel: string;
  amount: number;
  due: dayjs.Dayjs;
};

const TenantHome = () => {
  const { t } = useTranslation();
  const { user } = useCurrentUser();
  const [transferOpen, setTransferOpen] = useState(false);

  const displayName =
    user?.firstName ||
    user?.tenant?.firstName ||
    user?.email?.split("@")[0] ||
    t("dashboard.tenantHome.defaultName");

  const { data: apartmentData } = useQuery<MyApartmentResponse>({
    queryKey: ["me", "apartment"],
    queryFn: async () => {
      const result = await api.get<MyApartmentResponse>("/me/apartment");
      return result.data;
    },
    retry: false,
  });
  const landlord = apartmentData?.landlord ?? null;
  const rental = apartmentData?.rental ?? null;

  const landlordFullName =
    landlord?.firstName && landlord?.lastName
      ? `${landlord.firstName} ${landlord.lastName}`
      : null;

  const { data: invoicesData } = useQuery<MyInvoicesResponse>({
    queryKey: ["me", "invoices"],
    queryFn: async () => {
      const result = await api.get<MyInvoicesResponse>("/me/invoices");
      return result.data;
    },
  });

  const leaseEndLabel = useMemo(() => {
    if (!rental?.endDate) return null;
    const leaseEnd = dayjs(rental.endDate);
    const daysLeft = leaseEnd.startOf("day").diff(dayjs().startOf("day"), "day");

    return t("dashboard.tenantHome.leaseEnd.dateWithDays", {
      date: leaseEnd.format("D MMMM YYYY"),
      count: Math.abs(daysLeft),
      context:
        daysLeft < 0 ? "overdue" : daysLeft === 0 ? "today" : "remaining",
    });
  }, [rental?.endDate, t]);

  const upcomingRows = useMemo((): UpcomingRow[] => {
    const rows: UpcomingRow[] = [];
    const now = new Date();

    const unpaid = (invoicesData?.invoices ?? []).filter(
      (invoice: InvoiceType) => !invoice.isPaid
    );
    for (const invoice of unpaid) {
      rows.push({
        key: `inv-${invoice._id}`,
        kind: "invoice",
        label: invoice.invoiceID,
        typeLabel: getInvoiceTypeLabel(t, invoice.invoiceType),
        amount: invoice.amount,
        due: dayjs(invoice.dueDate),
      });
    }

    if (rental) {
      const due = getNextRentPaymentDate(rental.rentalPaymentDay, now);
      rows.push({
        key: "rent-next",
        kind: "rent",
        label: t("dashboard.tenantHome.upcoming.rentLine"),
        typeLabel: getInvoiceTypeLabel(t, "rent"),
        amount: rental.monthlyCost,
        due: dayjs(due),
      });
    }

    return rows.sort((a, b) => a.due.valueOf() - b.due.valueOf()).slice(0, 12);
  }, [invoicesData?.invoices, rental, t]);

  const dueRelativeLabel = (due: dayjs.Dayjs) => {
    const daysLeft = due.startOf("day").diff(dayjs().startOf("day"), "day");
    return t("dashboard.tenantHome.nextPayment.dueLabel", {
      date: due.format("D MMMM YYYY"),
      days: Math.abs(daysLeft),
      context:
        daysLeft < 0 ? "overdue" : daysLeft === 0 ? "today" : "remaining",
    });
  };

  const getDueDateClassName = (due: dayjs.Dayjs) => {
    const daysLeft = due.startOf("day").diff(dayjs().startOf("day"), "day");
    if (daysLeft < 3) return "text-red-600";
    if (daysLeft < 7) return "text-orange-500";
    return "text-slate-900";
  };

  return (
    <RouteContent>
      <TenantTransferDetailsModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        landlord={landlord}
      />
      <header className="border-b border-slate-200 bg-background px-8 py-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {t("dashboard.tenantHome.welcome", { name: displayName })}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("dashboard.tenantHome.subtitle")}
          </p>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                {t("dashboard.tenantHome.landlordContact.title")}
              </h2>
              <div className="mt-5 space-y-3">
                <p className="text-base font-semibold text-slate-900">
                  {landlordFullName ??
                    t("dashboard.tenantHome.landlordContact.unknown")}
                </p>
                {landlord?.phoneNumber ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{landlord.phoneNumber}</span>
                  </div>
                ) : null}
                {landlord?.email ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span>{landlord.email}</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-slate-900">
                <CalendarDays className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {t("dashboard.tenantHome.leaseEnd.title")}
                </h2>
              </div>
              {leaseEndLabel ? (
                <p className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
                  {leaseEndLabel}
                </p>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  {t("dashboard.tenantHome.leaseEnd.empty")}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-slate-900">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {t("dashboard.tenantHome.upcoming.title")}
                </h2>
              </div>
              <Button
                type="button"
                className="shrink-0 self-start sm:self-auto"
                onClick={() => setTransferOpen(true)}
              >
                {t("dashboard.tenantHome.transferCta")}
              </Button>
            </div>

            {upcomingRows.length === 0 ? (
              <div className="mt-5 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-800">
                  {t("dashboard.tenantHome.upcoming.empty")}
                </p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {upcomingRows.map((row) => (
                  <li
                    key={row.key}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {row.label}
                        </p>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-700"
                        >
                          {row.typeLabel}
                        </Badge>
                      </div>
                      <p
                        className={`text-xs sm:text-sm ${getDueDateClassName(
                          row.due
                        )}`}
                      >
                        {dueRelativeLabel(row.due)}
                      </p>
                    </div>
                    <p className="shrink-0 text-base font-bold text-slate-900">
                      {formatCurrency(row.amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
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
      const result = await api.get<TenantType[]>("/tenants");
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
      acc[String(apartment._id)] = {
        _id: String(apartment._id),
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
      acc[String(tenant._id)] = {
        firstName: tenant.firstName,
        lastName: tenant.lastName,
      };
      return acc;
    }, {});
  }, [tenantsList]);

  const tenantByApartmentId = useMemo(() => {
    if (!rentals || !tenantsList) return {};
    const activeRentals = rentals.filter((r) => r.isActive);
    return activeRentals.reduce<
      Record<string, { firstName: string; lastName: string }>
    >((acc, rental) => {
      const aptKey = String(rental.apartmentID);
      const tenant = tenantsById[String(rental.tenantID)];
      if (tenant && !acc[aptKey]) {
        acc[aptKey] = tenant;
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
