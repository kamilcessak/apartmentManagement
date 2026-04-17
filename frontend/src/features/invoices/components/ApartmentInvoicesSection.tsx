import { FC } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { CheckCircle2, Eye, Loader2, Plus, Trash2 } from "lucide-react";

import api from "@services/api";
import { capitalizeFirstLetter } from "@utils/common";
import { EmptyView } from "@components/common";

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

type Props = {
  apartmentID: string;
};

const formatCurrency = (value: number) => `${value.toFixed(2)} PLN`;

const InvoiceStatusBadge: FC<{ invoice: Pick<InvoiceType, "isPaid" | "dueDate"> }> = ({
  invoice,
}) => {
  if (invoice.isPaid) {
    return (
      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600/90">
        Paid
      </Badge>
    );
  }

  const isOverdue = dayjs(invoice.dueDate).isBefore(dayjs(), "day");
  if (isOverdue) {
    return <Badge variant="destructive">Overdue</Badge>;
  }

  return (
    <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">
      Unpaid
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
    <Card className="p-6 mb-6">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Invoices</h3>
        <Button
          variant="default"
          onClick={() => navigate(`/invoices/new?apartmentID=${apartmentID}`)}
        >
          <Plus />
          Add invoice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="size-5 animate-spin text-slate-400" />
        </div>
      ) : isError || !data ? (
        <p className="text-sm text-destructive mt-6">
          Unable to load invoices for this apartment.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <SummaryItem label="Total" value={formatCurrency(data.summary.total)} />
            <SummaryItem
              label="Paid"
              value={formatCurrency(data.summary.paidAmount)}
              accent="text-emerald-700"
            />
            <SummaryItem
              label="Unpaid"
              value={formatCurrency(data.summary.unpaidAmount)}
              accent="text-amber-700"
            />
            <SummaryItem
              label={`Overdue (${data.summary.overdueCount})`}
              value={formatCurrency(data.summary.overdueAmount)}
              accent="text-rose-700"
            />
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 overflow-hidden">
            {data.invoices.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="px-4">Description / ID</TableHead>
                    <TableHead className="px-4">Amount</TableHead>
                    <TableHead className="px-4">Due date</TableHead>
                    <TableHead className="px-4">Status</TableHead>
                    <TableHead className="px-4 text-right">Actions</TableHead>
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
                            {capitalizeFirstLetter(invoice.invoiceType)}
                          </span>
                        </div>
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
              <div className="bg-white">
                <EmptyView message="No invoices for this apartment yet" />
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};
