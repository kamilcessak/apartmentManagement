import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import dayjs from "dayjs";

import {
  EmptyView,
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import api from "@services/api";
import { capitalizeFirstLetter } from "@utils/common";

import { InvoiceStatusChip } from "@features/invoices/components/InvoiceStatusChip";
import { MyInvoicesResponse } from "../types";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

export const MyInvoicesScreen = () => {
  const { data, isLoading, isError, error, refetch } =
    useQuery<MyInvoicesResponse>({
      queryKey: ["me", "invoices"],
      queryFn: async () => {
        const result = await api.get<MyInvoicesResponse>("/me/invoices");
        return result.data;
      },
    });

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  const { invoices, summary } = data;

  return (
    <RouteContent>
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            My invoices
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Invoices issued for your apartment
          </Typography>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-6 p-8">
        {summary ? (
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border-2 border-gray-300 rounded-md p-4">
              <p className="text-gray-500 text-sm">Total</p>
              <p className="text-xl font-semibold">
                {formatCurrency(summary.total)}
              </p>
            </div>
            <div className="border-2 border-gray-300 rounded-md p-4">
              <p className="text-gray-500 text-sm">Paid</p>
              <p className="text-xl font-semibold text-green-700">
                {formatCurrency(summary.paidAmount)}
              </p>
            </div>
            <div className="border-2 border-gray-300 rounded-md p-4">
              <p className="text-gray-500 text-sm">Unpaid</p>
              <p className="text-xl font-semibold text-amber-700">
                {formatCurrency(summary.unpaidAmount)}
              </p>
            </div>
            <div className="border-2 border-gray-300 rounded-md p-4">
              <p className="text-gray-500 text-sm">
                Overdue ({summary.overdueCount})
              </p>
              <p className="text-xl font-semibold text-red-700">
                {formatCurrency(summary.overdueAmount)}
              </p>
            </div>
          </section>
        ) : null}

        {invoices.length === 0 ? (
          <EmptyView message="No invoices yet" />
        ) : (
          <section className="flex flex-col gap-3">
            {invoices.map((invoice) => (
              <div
                key={invoice._id}
                className="flex flex-row items-center justify-between border-2 border-gray-300 rounded-md p-4"
              >
                <div className="flex flex-col gap-1 flex-1">
                  <div className="flex flex-row items-center gap-2">
                    <Typography variant="subtitle1" className="font-semibold">
                      {invoice.invoiceID}
                    </Typography>
                    <InvoiceStatusChip invoice={invoice} />
                  </div>
                  <Typography variant="body2" className="text-gray-600">
                    {capitalizeFirstLetter(invoice.invoiceType)} &middot;{" "}
                    {formatCurrency(invoice.amount)} &middot; due{" "}
                    {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                  </Typography>
                </div>
                {invoice.document ? (
                  <a
                    href={invoice.document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View document
                  </a>
                ) : null}
              </div>
            ))}
          </section>
        )}
      </main>
    </RouteContent>
  );
};
