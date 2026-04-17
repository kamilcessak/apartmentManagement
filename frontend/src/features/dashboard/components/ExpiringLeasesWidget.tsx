import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import { CalendarClock, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { EmptyView } from "@components/common";
import { getApartmentIdFromAddress } from "@utils/apartment";

import { ExpiringLease } from "../types";

type TenantInfo = { firstName: string; lastName: string };

type Props = {
  leases: ExpiringLease[];
  apartmentsById: Record<string, { _id: string; address: string }>;
  tenantsById?: Record<string, TenantInfo>;
};

const formatMonthlyCost = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

export const ExpiringLeasesWidget: FC<Props> = ({
  leases,
  apartmentsById,
  tenantsById = {},
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sorted = useMemo(
    () =>
      [...leases].sort(
        (a, b) => dayjs(a.endDate).valueOf() - dayjs(b.endDate).valueOf()
      ),
    [leases]
  );

  const getSeverity = (daysLeft: number) => {
    if (daysLeft <= 7)
      return {
        accent: "border-l-destructive bg-destructive/5",
        badgeClass: "bg-destructive text-destructive-foreground",
        badgeLabel:
          daysLeft <= 0
            ? t("dashboard.leases.endsToday")
            : t("dashboard.leases.daysLeft", { count: daysLeft }),
      };
    if (daysLeft <= 14)
      return {
        accent: "border-l-warning bg-warning/5",
        badgeClass: "bg-warning text-warning-foreground",
        badgeLabel: t("dashboard.leases.daysLeft", { count: daysLeft }),
      };
    return {
      accent: "border-l-slate-300 bg-slate-50/60",
      badgeClass: "bg-muted text-muted-foreground",
      badgeLabel: t("dashboard.leases.daysLeft", { count: daysLeft }),
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            {t("dashboard.leases.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.leases.description")}
          </CardDescription>
        </div>
        <Badge
          variant={leases.length > 0 ? "destructive" : "secondary"}
          className={
            leases.length > 0 ? "bg-warning text-warning-foreground" : undefined
          }
        >
          {t("dashboard.leases.expiringBadge", { count: leases.length })}
        </Badge>
      </CardHeader>
      <CardContent>
        {sorted.length ? (
          <ul className="flex flex-col gap-3">
            {sorted.map((lease) => {
              const apartment = apartmentsById[lease.apartmentID];
              const apartmentLabel = apartment?.address
                ? getApartmentIdFromAddress(apartment.address)
                : t("dashboard.leases.unknownApartment");
              const tenant = tenantsById[lease.tenantID];
              const tenantName = tenant
                ? `${tenant.firstName} ${tenant.lastName}`.trim()
                : t("dashboard.leases.unassignedTenant");

              const daysLeft = dayjs(lease.endDate)
                .startOf("day")
                .diff(dayjs().startOf("day"), "day");

              const severity = getSeverity(daysLeft);

              return (
                <li key={`lease-${lease._id}`}>
                  <button
                    type="button"
                    onClick={() => navigate(`/rental/${lease._id}`)}
                    className={cn(
                      "flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 border-l-4 p-4 text-left transition-colors hover:bg-slate-50",
                      severity.accent
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
                        <CalendarClock className="h-5 w-5" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-sm font-semibold text-slate-900">
                          {apartmentLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {tenantName} ·{" "}
                          {t("dashboard.leases.monthlyCost", {
                            amount: formatMonthlyCost(lease.monthlyCost),
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-slate-900">
                          {dayjs(lease.endDate).format("DD.MM.YYYY")}
                        </span>
                        <Badge
                          variant="default"
                          className={severity.badgeClass}
                        >
                          {severity.badgeLabel}
                        </Badge>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyView message={t("dashboard.leases.empty")} />
        )}
      </CardContent>
    </Card>
  );
};
