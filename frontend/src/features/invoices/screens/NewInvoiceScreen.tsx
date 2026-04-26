import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

export const NewInvoiceScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefilledApartmentID = searchParams.get("apartmentID") ?? undefined;

  const {
    data: apartments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["apartments", "select", "all-owned"],
    queryFn: fetchLandlordApartmentsForSelect,
  });

  const handleCreateInvoice = async (values: InvoiceFormValues) => {
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
    const response = await api.post("/invoice", payload);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleCreateInvoice,
    onSuccess: (response) => {
      if (response.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["invoices"] });
        if (prefilledApartmentID) {
          queryClient.invalidateQueries({
            queryKey: ["apartment", prefilledApartmentID, "invoices"],
          });
        }
        toast(t("invoices.newInvoice.successToast"), { type: "success" });
        navigate(-1);
      }
    },
    onError: () => {
      toast(t("invoices.newInvoice.errorToast"), { type: "error" });
    },
  });

  const defaultValues = useMemo(
    () => ({
      apartmentID: prefilledApartmentID ?? "",
    }),
    [prefilledApartmentID]
  );

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

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
                aria-label={t("invoices.newInvoice.back")}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("invoices.newInvoice.title")}
              </h1>
            </header>

            <Card className="border-slate-200 shadow-sm">
              <InvoiceForm
                apartments={apartments ?? []}
                defaultValues={defaultValues}
                submitLabel={t("invoices.newInvoice.submit")}
                cancelLabel={t("invoices.newInvoice.cancel")}
                isSubmitting={isPending}
                lockApartment={!!prefilledApartmentID}
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
