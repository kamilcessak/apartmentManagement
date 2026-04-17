import { FC, useMemo } from "react";
import { CircularProgress, IconButton, Typography } from "@mui/material";
import { MdDelete, MdOutlineVisibility, MdPaid } from "react-icons/md";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import api from "@services/api";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

import { InvoiceType } from "../types";
import { InvoiceStatusChip } from "./InvoiceStatusChip";

type Props = {
  invoice: InvoiceType;
  showApartment?: boolean;
};

export const InvoiceItem: FC<Props> = ({ invoice, showApartment = true }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleDeleteInvoice = async (id: string) => {
    const result = await api.delete(`/invoice/${id}`);
    return result;
  };

  const handleMarkAsPaid = async (id: string) => {
    const result = await api.patch(`/invoice/${id}`, { isPaid: true });
    return result;
  };

  const handleGetApartment = async () => {
    const result = await api.get(`/apartment/${invoice.apartmentID}`);
    return result.data;
  };

  const { data: apartmentData, isLoading: isApartmentLoading } = useQuery({
    queryKey: ["apartment", `${invoice.apartmentID}`, "SHORT"],
    queryFn: handleGetApartment,
    enabled: showApartment,
  });

  const invalidateLists = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
    queryClient.invalidateQueries({
      queryKey: ["apartment", `${invoice.apartmentID}`, "invoices"],
    });
  };

  const { mutate: deleteInvoice, isPending: isDeleting } = useMutation({
    mutationFn: handleDeleteInvoice,
    onSuccess: () => {
      invalidateLists();
      toast("Invoice deleted successfully", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during deleting invoice", { type: "error" });
    },
  });

  const { mutate: markAsPaid, isPending: isMarkingPaid } = useMutation({
    mutationFn: handleMarkAsPaid,
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

  const apartmentLabel = useMemo(() => {
    if (!showApartment) return null;
    if (isApartmentLoading) return "Loading apartment...";
    if (!apartmentData?.address) return "Unknown apartment";
    return getApartmentIdFromAddress(apartmentData.address);
  }, [apartmentData, isApartmentLoading, showApartment]);

  return (
    <div className="flex flex-row items-center justify-between border-gray-400 rounded-md border-2 p-4">
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex flex-row items-center gap-2">
          <Typography variant="subtitle1" className="font-semibold">
            {invoice.invoiceID}
          </Typography>
          <InvoiceStatusChip invoice={invoice} />
        </div>
        <Typography variant="body2" className="text-gray-600">
          {capitalizeFirstLetter(invoice.invoiceType)} &middot;{" "}
          {invoice.amount.toFixed(2)} PLN &middot; due{" "}
          {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
        </Typography>
        {apartmentLabel ? (
          <Typography variant="caption" className="text-gray-500">
            {apartmentLabel}
          </Typography>
        ) : null}
      </div>
      <div className="flex flex-row items-center gap-1">
        {!invoice.isPaid ? (
          <IconButton
            color="success"
            onClick={() => markAsPaid(invoice._id)}
            disabled={isMarkingPaid}
            title="Mark as paid"
          >
            {isMarkingPaid ? <CircularProgress size={24} /> : <MdPaid size={24} />}
          </IconButton>
        ) : null}
        <IconButton
          color="primary"
          onClick={() => navigate(`/invoice/${invoice._id}`)}
          title="Details"
        >
          <MdOutlineVisibility size={24} />
        </IconButton>
        <IconButton
          color="error"
          onClick={() => deleteInvoice(invoice._id)}
          disabled={isDeleting}
          title="Delete invoice"
        >
          {isDeleting ? <CircularProgress size={24} /> : <MdDelete size={24} />}
        </IconButton>
      </div>
    </div>
  );
};
