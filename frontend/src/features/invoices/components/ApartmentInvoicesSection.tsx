import { FC } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button, CircularProgress, Divider, Typography } from "@mui/material";
import { MdAdd } from "react-icons/md";
import { useNavigate } from "react-router-dom";

import api from "@services/api";
import { DetailsSectionHeader } from "@components/header";
import { EmptyView } from "@components/common";

import { ApartmentInvoicesResponse } from "../types";
import { InvoiceItem } from "./InvoiceItem";

type Props = {
  apartmentID: string;
};

export const ApartmentInvoicesSection: FC<Props> = ({ apartmentID }) => {
  const navigate = useNavigate();

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

  return (
    <section className="flex flex-col gap-4 border-2 border-gray-700 rounded-md p-4">
      <DetailsSectionHeader
        title="Invoices"
        onClickButton={() =>
          navigate(`/invoices/new?apartmentID=${apartmentID}`)
        }
        editMode
        editModeButton={
          <Button
            variant="contained"
            color="success"
            startIcon={<MdAdd />}
            onClick={() =>
              navigate(`/invoices/new?apartmentID=${apartmentID}`)
            }
            style={{ textTransform: "none" }}
          >
            <Typography variant="body2">Add invoice</Typography>
          </Button>
        }
      />
      <Divider />

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <CircularProgress size={24} />
        </div>
      ) : isError || !data ? (
        <Typography variant="body2" color="error">
          Unable to load invoices for this apartment.
        </Typography>
      ) : (
        <>
          <div className="flex flex-row flex-wrap gap-6">
            <div className="flex flex-col">
              <Typography variant="caption" color="textSecondary">
                Total
              </Typography>
              <Typography variant="subtitle1">
                {data.summary.total.toFixed(2)} PLN
              </Typography>
            </div>
            <div className="flex flex-col">
              <Typography variant="caption" color="textSecondary">
                Paid
              </Typography>
              <Typography variant="subtitle1" className="text-green-700">
                {data.summary.paidAmount.toFixed(2)} PLN
              </Typography>
            </div>
            <div className="flex flex-col">
              <Typography variant="caption" color="textSecondary">
                Unpaid
              </Typography>
              <Typography variant="subtitle1" className="text-amber-700">
                {data.summary.unpaidAmount.toFixed(2)} PLN
              </Typography>
            </div>
            <div className="flex flex-col">
              <Typography variant="caption" color="textSecondary">
                Overdue ({data.summary.overdueCount})
              </Typography>
              <Typography variant="subtitle1" className="text-red-700">
                {data.summary.overdueAmount.toFixed(2)} PLN
              </Typography>
            </div>
          </div>
          <Divider />
          {data.invoices.length ? (
            <div className="flex flex-col gap-2">
              {data.invoices.map((invoice) => (
                <InvoiceItem
                  key={`apartment-invoice-${invoice._id}`}
                  invoice={invoice}
                  showApartment={false}
                />
              ))}
            </div>
          ) : (
            <EmptyView message="No invoices for this apartment yet" />
          )}
        </>
      )}
    </section>
  );
};
