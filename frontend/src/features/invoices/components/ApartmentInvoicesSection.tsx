import { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Plus,
  Receipt,
  Trash2,
} from "lucide-react";

import api from "@services/api";
import { getInvoiceTypeLabel } from "../utils/invoiceTypeLabel";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ApartmentInvoicesResponse, InvoiceType } from "../types";
import { formatInvoiceTenantLabel } from "../utils/invoiceTenantDisplay";

type Props = {
  apartmentID: string;
};

const formatCurrency = (value: number) => `${value.toFixed(2)} PLN`;

const InvoiceStatusBadge: FC<{ invoice: Pick<InvoiceType, "isPaid" | "dueDate"> }> = ({
  invoice,
}) => {
  const { t } = useTranslation();

  if (invoice.isPaid) {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        {t("invoices.apartmentSection.status.paid")}
      </Badge>
    );
  }

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), "day");
  if (isOverdue) {
    return (
      <Badge variant="destructive">
        {t("invoices.apartmentSection.status.overdue")}
      </Badge>
    );
  }

  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">
      {t("invoices.apartmentSection.status.unpaid")}
    </Badge>
  );
};

const SummaryItem: FC<{ label: string; value: string; accent?: string }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`font-medium ${accent ?? "text-slate-900"}`}>{value}</span>
  </div>
);

export const ApartmentInvoicesSection: FC<Props> = ({ apartmentID }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleGetInvoices = async () => {
    const result = await api.get<ApartmentInvoicesResponse>(
      `/apartment/${apartmentID}/invoices`
    );
    return result.data;
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["apartment", apartmentID, "invoices"],
    queryFn: handleGetInvoices,
    enabled: !!apartmentID,
  });

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({
      queryKey: ["apartment", apartmentID, "invoices"],
    });
  };

  const { mutate: deleteInvoice, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => api.delete(`/invoice/${id}`),
    onSuccess: () => {
      invalidateLists();
      toast("Invoice deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting invoice", { type: "error" });
    },
  });

  const { mutate: markAsPaid, isPending: isMarkingPaid } = useMutation({
    mutationFn: async (id: string) => api.patch(`/invoice/${id}`, { isPaid: true }),
    onSuccess: () => {
      invalidateLists();
      toast("Invoice marked as paid", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during marking invoice as paid", {
        type: "error",
      });
    },
  });

  return (
    <Card className="p-6 border-slate-200 shadow-sm">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">
          {t("invoices.apartmentSection.title")}
        </h3>
        <Button
          variant="default"
          className="gap-2"
          onClick={() => navigate(`/invoices/new?apartmentID=${apartmentID}`)}
        >
          <Plus className="size-4" />
          {t("invoices.apartmentSection.addInvoice")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-slate-400" />
        </div>
      ) : isError || !data ? (
        <p className="text-sm text-destructive mt-6">
          {t("invoices.apartmentSection.loadError")}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <SummaryItem
              label={t("invoices.apartmentSection.summary.total")}
              value={formatCurrency(data.summary.total)}
            />
            <SummaryItem
              label={t("invoices.apartmentSection.summary.paid")}
              value={formatCurrency(data.summary.paidAmount)}
              accent="text-emerald-700"
            />
            <SummaryItem
              label={t("invoices.apartmentSection.summary.unpaid")}
              value={formatCurrency(data.summary.unpaidAmount)}
              accent="text-amber-700"
            />
            <SummaryItem
              label={t("invoices.apartmentSection.summary.overdue", {
                count: data.summary.overdueCount,
              })}
              value={formatCurrency(data.summary.overdueAmount)}
              accent="text-rose-700"
            />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 overflow-hidden">
            {data.invoices.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="px-4">
                      {t("invoices.apartmentSection.columns.invoice")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("invoices.apartmentSection.columns.tenant")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("invoices.apartmentSection.columns.amount")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("invoices.apartmentSection.columns.dueDate")}
                    </TableHead>
                    <TableHead className="px-4">
                      {t("invoices.apartmentSection.columns.status")}
                    </TableHead>
                    <TableHead className="px-4 text-right">
                      {t("invoices.apartmentSection.columns.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.invoices.map((invoice) => (
                    <TableRow key={`apartment-invoice-${invoice._id}`}>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900">
                            {invoice.invoiceID}
                          </span>
                          <span className="text-xs text-slate-500">
                            {getInvoiceTypeLabel(t, invoice.invoiceType)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-600">
                        {formatInvoiceTenantLabel(invoice) ??
                          t("invoices.list.noTenant")}
                      </TableCell>
                      <TableCell className="px-4 py-3 font-medium text-slate-900">
                        {formatCurrency(invoice.amount)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-slate-700">
                        {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <InvoiceStatusBadge invoice={invoice} />
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-row items-center justify-end gap-1">
                          {!invoice.isPaid ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="Mark as paid"
                              title="Mark as paid"
                              disabled={isMarkingPaid}
                              onClick={() => markAsPaid(invoice._id)}
                              className="text-emerald-600 hover:text-emerald-700"
                            >
                              {isMarkingPaid ? (
                                <Loader2 className="animate-spin" />
                              ) : (
                                <CheckCircle2 />
                              )}
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Details"
                            title="Details"
                            onClick={() => navigate(`/invoice/${invoice._id}`)}
                          >
                            <Eye />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete invoice"
                            title="Delete invoice"
                            disabled={isDeleting}
                            onClick={() => deleteInvoice(invoice._id)}
                            className="text-rose-600 hover:text-rose-700"
                          >
                            {isDeleting ? (
                              <Loader2 className="animate-spin" />
                            ) : (
                              <Trash2 />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-lg bg-gray-50 py-8 px-4">
                <Receipt className="size-8 shrink-0 text-gray-400" strokeWidth={1.5} />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {t("invoices.apartmentSection.emptyState")}
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
