import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { ApartmentListType } from "@features/apartments/types/apartment.type";

import { InvoiceForm, InvoiceFormValues } from "../components";
import { InvoiceType } from "../types";

export const EditInvoiceScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleGetInvoice = async () => {
    const result = await api.get<InvoiceType>(`/invoice/${id}`);
    return result.data;
  };

  const handleGetApartments = async () => {
    const result = await api.get<ApartmentListType[]>("/apartmentsList");
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
    queryKey: ["apartments", "ids", "LIST"],
    queryFn: handleGetApartments,
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
      toast("Invoice updated successfully", { type: "success" });
      navigate(`/invoice/${id}`);
    },
    onError: () => {
      toast("An error occurred during updating the invoice", { type: "error" });
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
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl">Edit invoice</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <InvoiceForm
          apartments={apartments ?? []}
          defaultValues={defaultValues}
          submitLabel="Save changes"
          isSubmitting={isPending}
          onSubmit={(values) => mutate(values)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </RouteContent>
  );
};
