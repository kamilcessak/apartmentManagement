import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft, MdEdit, MdPaid, MdUndo } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Button,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { DetailsInformationItem } from "@components/sections";
import { capitalizeFirstLetter } from "@utils/common";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { ApartmentType } from "@features/apartments/types/apartment.type";

import { InvoiceType } from "../types";
import { InvoiceStatusChip } from "../components";

export const InvoiceDetailsScreen = () => {
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
      toast("Invoice status updated", { type: "success" });
    },
    onError: () => {
      toast("Failed to update invoice status", { type: "error" });
    },
  });

  const handlePreviewDocument = async () => {
    if (!invoice?.document) return;
    try {
      const response = await api.get(`/upload/${invoice.document}`);
      window.open(response.data.url, "_blank");
    } catch {
      toast("Failed to load document", { type: "error" });
    }
  };

  const apartmentLabel = useMemo(() => {
    if (!apartment?.address) return "—";
    return getApartmentIdFromAddress(apartment.address);
  }, [apartment]);

  if (isLoading) return <LoadingView />;
  if (isError || !invoice)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  return (
    <RouteContent>
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-semibold">
            Invoice {invoice.invoiceID}
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <Typography variant="h6">{invoice.invoiceID}</Typography>
              <InvoiceStatusChip invoice={invoice} />
            </div>
            <div className="flex flex-row gap-2">
              {!invoice.isPaid ? (
                <Button
                  color="success"
                  variant="contained"
                  startIcon={
                    isToggling ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <MdPaid />
                    )
                  }
                  disabled={isToggling}
                  onClick={() => togglePaid(true)}
                  style={{ textTransform: "none" }}
                >
                  Mark as paid
                </Button>
              ) : (
                <Button
                  color="warning"
                  variant="outlined"
                  startIcon={
                    isToggling ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <MdUndo />
                    )
                  }
                  disabled={isToggling}
                  onClick={() => togglePaid(false)}
                  style={{ textTransform: "none" }}
                >
                  Mark as unpaid
                </Button>
              )}
              <Button
                color="primary"
                variant="outlined"
                startIcon={<MdEdit />}
                onClick={() => navigate(`/invoice/${invoice._id}/edit`)}
                style={{ textTransform: "none" }}
              >
                Edit
              </Button>
            </div>
          </div>
          <Divider />
          <div className="flex flex-row flex-wrap gap-8">
            <DetailsInformationItem
              title="Apartment"
              subtitle={apartmentLabel}
            />
            <DetailsInformationItem
              title="Type"
              subtitle={capitalizeFirstLetter(invoice.invoiceType)}
            />
            <DetailsInformationItem
              title="Amount"
              subtitle={`${invoice.amount.toFixed(2)} PLN`}
            />
            <DetailsInformationItem
              title="Due date"
              subtitle={dayjs(invoice.dueDate).format("DD.MM.YYYY")}
            />
            <DetailsInformationItem
              title="Upload date"
              subtitle={dayjs(invoice.uploadDate).format("DD.MM.YYYY")}
            />
            <DetailsInformationItem
              title="Paid date"
              subtitle={
                invoice.paidDate
                  ? dayjs(invoice.paidDate).format("DD.MM.YYYY")
                  : "—"
              }
            />
          </div>
        </section>

        <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
          <Typography variant="h6">Invoice document</Typography>
          <Divider />
          {invoice.document ? (
            <Paper variant="outlined" className="p-4">
              <div className="flex flex-row items-center justify-between gap-4">
                <Typography variant="body2" className="truncate">
                  {invoice.document}
                </Typography>
                <Button
                  variant="contained"
                  onClick={handlePreviewDocument}
                  style={{ textTransform: "none" }}
                >
                  Open document
                </Button>
              </div>
            </Paper>
          ) : (
            <Typography variant="body2" color="textSecondary">
              No document attached.
            </Typography>
          )}
        </section>
      </main>
    </RouteContent>
  );
};
