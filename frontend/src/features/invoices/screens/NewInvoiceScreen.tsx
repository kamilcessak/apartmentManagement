import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { ApartmentListType } from "@features/apartments/types/apartment.type";

import { InvoiceForm, InvoiceFormValues } from "../components";

export const NewInvoiceScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const prefilledApartmentID = searchParams.get("apartmentID") ?? undefined;

  const handleGetApartments = async () => {
    const result = await api.get<ApartmentListType[]>("/apartmentsList");
    return result.data;
  };

  const {
    data: apartments,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["apartments", "ids", "LIST"],
    queryFn: handleGetApartments,
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
        toast("Invoice created successfully", { type: "success" });
        navigate(-1);
      }
    },
    onError: () => {
      toast("An error occurred during creating the invoice", { type: "error" });
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
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl">Add new invoice</h1>
        </div>
      </header>
      <div className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <InvoiceForm
          apartments={apartments ?? []}
          defaultValues={defaultValues}
          submitLabel="Create invoice"
          isSubmitting={isPending}
          lockApartment={!!prefilledApartmentID}
          onSubmit={(values) => mutate(values)}
          onCancel={() => navigate(-1)}
        />
      </div>
    </RouteContent>
  );
};
