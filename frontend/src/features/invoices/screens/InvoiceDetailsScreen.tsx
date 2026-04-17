import { FC, ReactNode, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  FileText,
  FileX,
  Loader2,
  MoreHorizontal,
  Pencil,
  Upload,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { ApartmentType } from "@features/apartments/types/apartment.type";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { InvoiceCategory, InvoiceType } from "../types";
import { InvoiceStatusChip } from "../components";

type DataItemProps = {
  label: string;
  children: ReactNode;
  emphasized?: boolean;
};

const DataItem: FC<DataItemProps> = ({ label, children, emphasized }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-slate-500">{label}</span>
    <span
      className={
        emphasized
          ? "text-2xl font-bold text-slate-900"
          : "text-base font-medium text-slate-900"
      }
    >
      {children}
    </span>
  </div>
);

export const InvoiceDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleGetInvoice = async () => {
    const result = await api.get<InvoiceType>(`/invoice/${id}`);
    return result.data;
  };

  const {
    data: invoice,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["invoice", `${id}`],
    queryFn: handleGetInvoice,
    enabled: !!id,
  });

  const handleGetApartment = async () => {
    const result = await api.get<ApartmentType>(
      `/apartment/${invoice?.apartmentID}`
    );
    return result.data;
  };

  const { data: apartment } = useQuery({
    queryKey: ["apartment", `${invoice?.apartmentID}`, "DETAILS"],
    queryFn: handleGetApartment,
    enabled: !!invoice?.apartmentID,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({ queryKey: ["invoice", `${id}`] });
    if (invoice?.apartmentID) {
      queryClient.invalidateQueries({
        queryKey: ["apartment", invoice.apartmentID, "invoices"],
      });
    }
  };

  const handleTogglePaid = async (markPaid: boolean) => {
    const payload = markPaid
      ? { isPaid: true }
      : { isPaid: false, paidDate: null };
    const response = await api.patch(`/invoice/${id}`, payload);
    return response;
  };

  const { mutate: togglePaid, isPending: isToggling } = useMutation({
    mutationFn: handleTogglePaid,
    onSuccess: () => {
      invalidate();
      toast(t("invoices.details.toasts.updateSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("invoices.details.toasts.updateError"), { type: "error" });
    },
  });

  const handlePreviewDocument = async () => {
    if (!invoice?.document) return;
    try {
      const response = await api.get(`/upload/${invoice.document}`);
      window.open(response.data.url, "_blank");
    } catch {
      toast(t("invoices.details.toasts.previewError"), { type: "error" });
    }
  };

  const apartmentLabel = useMemo(() => {
    if (!apartment?.address) return t("invoices.details.fields.empty");
    return getApartmentIdFromAddress(apartment.address);
  }, [apartment, t]);

  if (isLoading) return <LoadingView />;
  if (isError || !invoice)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  const typeLabel = t(`invoices.types.${invoice.invoiceType as InvoiceCategory}`, {
    defaultValue: invoice.invoiceType,
  });

  return (
    <RouteContent>
      <div className="flex h-full flex-col bg-slate-50">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto w-full max-w-5xl">
            <header className="mb-6 flex flex-row items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label={t("invoices.details.back")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("invoices.details.title", { id: invoice.invoiceID })}
              </h1>
              <InvoiceStatusChip invoice={invoice} />

              <div className="ml-auto flex flex-row items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/invoice/${invoice._id}/edit`)}
                >
                  <Pencil className="h-4 w-4" />
                  {t("invoices.details.actions.edit")}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={isToggling}
                      aria-label={t("invoices.details.actions.openStatusMenu")}
                    >
                      {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {invoice.isPaid ? (
                      <DropdownMenuItem
                        onClick={() => togglePaid(false)}
                        disabled={isToggling}
                      >
                        {t("invoices.details.actions.markAsUnpaid")}
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => togglePaid(true)}
                        disabled={isToggling}
                      >
                        {t("invoices.details.actions.markAsPaid")}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            <Card className="border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                <DataItem label={t("invoices.details.fields.apartment")}>
                  {apartmentLabel}
                </DataItem>
                <DataItem label={t("invoices.details.fields.type")}>
                  {typeLabel}
                </DataItem>
                <DataItem
                  label={t("invoices.details.fields.amount")}
                  emphasized
                >
                  {t("invoices.details.amountWithCurrency", {
                    value: invoice.amount.toFixed(2),
                  })}
                </DataItem>
                <DataItem label={t("invoices.details.fields.dueDate")}>
                  {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                </DataItem>
                <DataItem label={t("invoices.details.fields.uploadDate")}>
                  {dayjs(invoice.uploadDate).format("DD.MM.YYYY")}
                </DataItem>
                <DataItem label={t("invoices.details.fields.paidDate")}>
                  {invoice.paidDate
                    ? dayjs(invoice.paidDate).format("DD.MM.YYYY")
                    : t("invoices.details.fields.empty")}
                </DataItem>
              </div>
            </Card>

            <Card className="mt-6 border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                {t("invoices.details.document.title")}
              </h2>

              {invoice.document ? (
                <div className="mt-4 flex flex-row items-center justify-between gap-4 rounded-md border border-slate-200 p-4">
                  <div className="flex min-w-0 flex-row items-center gap-3">
                    <FileText className="h-5 w-5 shrink-0 text-slate-500" />
                    <span className="truncate text-sm text-slate-900">
                      {invoice.document}
                    </span>
                  </div>
                  <Button variant="outline" onClick={handlePreviewDocument}>
                    {t("invoices.details.document.open")}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center gap-3 py-10 text-center">
                  <FileX className="h-16 w-16 text-slate-300" strokeWidth={1.5} />
                  <p className="text-sm text-slate-500">
                    {t("invoices.details.document.empty")}
                  </p>
                  <Button variant="outline" className="mt-2">
                    <Upload className="h-4 w-4" />
                    {t("invoices.details.document.upload")}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </RouteContent>
  );
};
