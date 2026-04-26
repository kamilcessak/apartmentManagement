import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { fetchLandlordApartmentsForSelect } from "@features/apartments/fetchLandlordApartmentsForSelect";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { InvoiceForm, InvoiceFormValues } from "../components";
import { InvoiceType } from "../types";

export const EditInvoiceScreen = () => {
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
    isLoading: isInvoiceLoading,
    isError: isInvoiceError,
    error: invoiceError,
    refetch: refetchInvoice,
  } = useQuery({
    queryKey: ["invoice", `${id}`],
    queryFn: handleGetInvoice,
    enabled: !!id,
  });

  const {
    data: apartments,
    isLoading: isApartmentsLoading,
    isError: isApartmentsError,
    error: apartmentsError,
    refetch: refetchApartments,
  } = useQuery({
    queryKey: ["apartments", "select", "all-owned"],
    queryFn: fetchLandlordApartmentsForSelect,
  });

  const handlePatchInvoice = async (values: InvoiceFormValues) => {
    const payload = {
      apartmentID: values.apartmentID,
      invoiceID: values.invoiceID,
      invoiceType: values.invoiceType,
      amount: values.amount,
      dueDate: values.dueDate
        ? new Date(values.dueDate).toISOString()
        : undefined,
      document: values.document,
    };
    const response = await api.patch(`/invoice/${id}`, payload);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", `${id}`] });
      if (invoice?.apartmentID) {
        queryClient.invalidateQueries({
          queryKey: ["apartment", invoice.apartmentID, "invoices"],
        });
      }
      toast(t("invoices.editInvoice.successToast"), { type: "success" });
      navigate(`/invoice/${id}`);
    },
    onError: () => {
      toast(t("invoices.editInvoice.errorToast"), { type: "error" });
    },
  });

  const defaultValues = useMemo(
    () =>
      invoice
        ? {
            apartmentID: invoice.apartmentID,
            invoiceID: invoice.invoiceID,
            invoiceType: invoice.invoiceType,
            amount: invoice.amount,
            dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
            document: invoice.document,
          }
        : {},
    [invoice]
  );

  if (isInvoiceLoading || isApartmentsLoading) return <LoadingView />;
  if (isInvoiceError || isApartmentsError || !invoice)
    return (
      <ErrorView
        message={`${invoiceError?.message ?? ""} ${apartmentsError?.message ?? ""}`}
        onClick={() => {
          refetchInvoice();
          refetchApartments();
        }}
      />
    );

  return (
    <RouteContent>
      <div className="flex h-full flex-col bg-slate-50">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto w-full max-w-4xl">
            <header className="mb-6 flex flex-row items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                aria-label={t("invoices.editInvoice.back")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("invoices.editInvoice.title")}
              </h1>
            </header>

            <Card className="border-slate-200 shadow-sm">
              <InvoiceForm
                apartments={apartments ?? []}
                defaultValues={defaultValues}
                submitLabel={t("invoices.editInvoice.submit")}
                cancelLabel={t("invoices.editInvoice.cancel")}
                isSubmitting={isPending}
                onSubmit={(values) => mutate(values)}
                onCancel={() => navigate(-1)}
              />
            </Card>
          </div>
        </div>
      </div>
    </RouteContent>
  );
};
