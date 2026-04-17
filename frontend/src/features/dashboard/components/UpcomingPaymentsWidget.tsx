import { FC, useMemo } from "react";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Badge } from "@components/ui/badge";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { EmptyView } from "@components/common";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

import { UpcomingPayment } from "../types";

type TenantInfo = { firstName: string; lastName: string };

type Props = {
  payments: UpcomingPayment[];
  apartmentsById: Record<string, { _id: string; address: string }>;
  tenantsById?: Record<string, TenantInfo>;
  tenantByApartmentId?: Record<string, TenantInfo>;
};

const getInitials = (first?: string, last?: string) => {
  const a = (first ?? "").charAt(0);
  const b = (last ?? "").charAt(0);
  return `${a}${b}`.toUpperCase() || "?";
};

export const UpcomingPaymentsWidget: FC<Props> = ({
  payments,
  apartmentsById,
  tenantsById = {},
  tenantByApartmentId = {},
}) => {
  const { t } = useTranslation();

  const sorted = useMemo(
    () =>
      [...payments].sort(
        (a, b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()
      ),
    [payments]
  );

  const getDueBadge = (dueDate: string) => {
    const diff = dayjs(dueDate)
      .startOf("day")
      .diff(dayjs().startOf("day"), "day");
    if (diff < 0)
      return {
        label: t("dashboard.upcoming.daysOverdue", { count: Math.abs(diff) }),
        variant: "destructive" as const,
      };
    if (diff === 0)
      return {
        label: t("dashboard.upcoming.dueToday"),
        variant: "destructive" as const,
      };
    if (diff <= 3)
      return {
        label: t("dashboard.upcoming.daysLeft", { count: diff }),
        variant: "default" as const,
        tone: "warning" as const,
      };
    return {
      label: t("dashboard.upcoming.daysLeft", { count: diff }),
      variant: "secondary" as const,
    };
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-base font-semibold">
            {t("dashboard.upcoming.title")}
          </CardTitle>
          <CardDescription>
            {t("dashboard.upcoming.description")}
          </CardDescription>
        </div>
        <Badge variant={payments.length > 0 ? "default" : "secondary"}>
          {t("dashboard.upcoming.countBadge", { count: payments.length })}
        </Badge>
      </CardHeader>
      <CardContent className="p-0">
        {sorted.length ? (
          <Table>
            <TableHeader>
              <TableRow className="border-b">
                <TableHead className="pl-6">
                  {t("dashboard.upcoming.columns.tenant")}
                </TableHead>
                <TableHead>
                  {t("dashboard.upcoming.columns.description")}
                </TableHead>
                <TableHead className="text-right">
                  {t("dashboard.upcoming.columns.amount")}
                </TableHead>
                <TableHead className="pr-6 text-right">
                  {t("dashboard.upcoming.columns.dueDate")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((payment) => {
                const apartment = apartmentsById[payment.apartmentID];
                const apartmentLabel = apartment?.address
                  ? getApartmentIdFromAddress(apartment.address)
                  : t("dashboard.upcoming.unknownApartment");

                const tenant =
                  payment.kind === "rental"
                    ? tenantsById[payment.tenantID] ??
                      tenantByApartmentId[payment.apartmentID]
                    : tenantByApartmentId[payment.apartmentID];

                const tenantName = tenant
                  ? `${tenant.firstName} ${tenant.lastName}`.trim()
                  : t("dashboard.upcoming.unassignedTenant");

                const description =
                  payment.kind === "invoice"
                    ? t("dashboard.upcoming.invoiceDescription", {
                        type: capitalizeFirstLetter(payment.invoiceType),
                        id: payment.invoiceID,
                      })
                    : t("dashboard.upcoming.rentDescription", {
                        day: payment.rentalPaymentDay,
                      });

                const badge = getDueBadge(payment.dueDate);

                return (
                  <TableRow
                    key={`${payment.kind}-${payment._id}`}
                    className="hover:bg-muted/40"
                  >
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(tenant?.firstName, tenant?.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                          <span className="text-sm font-medium text-slate-900">
                            {tenantName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {apartmentLabel}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="text-sm text-slate-700">
                        {description}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <span className="text-sm font-semibold text-slate-900">
                        {payment.amount.toFixed(2)} PLN
                      </span>
                    </TableCell>
                    <TableCell className="pr-6 py-3">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                          {dayjs(payment.dueDate).format("DD.MM.YYYY")}
                        </span>
                        <Badge
                          variant={badge.variant}
                          className={cn(
                            badge.tone === "warning" &&
                              "bg-warning text-warning-foreground"
                          )}
                        >
                          {badge.label}
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6">
            <EmptyView message={t("dashboard.upcoming.empty")} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
