import { useQuery, useMutation } from "@tanstack/react-query";
import { Typography, CircularProgress } from "@mui/material";
import { MdDescription, MdVisibility } from "react-icons/md";
import dayjs from "dayjs";

import {
  EmptyView,
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import api from "@services/api";

import { MyDocumentsResponse } from "../types";

type DocumentTileProps = {
  label: string;
  filename: string;
  caption?: string;
};

const DocumentTile = ({ label, filename, caption }: DocumentTileProps) => {
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const response = await api.get(`/upload/${filename}`);
      return response.data as { url: string };
    },
    onSuccess: (data) => {
      window.open(data.url, "_blank");
    },
  });

  return (
    <div className="flex flex-col items-center border-2 border-gray-300 rounded-md p-4 gap-2 w-52">
      <MdDescription size={48} />
      <Typography
        variant="body2"
        className="text-center break-all"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 2,
        }}
      >
        {label}
      </Typography>
      {caption ? (
        <Typography variant="caption" className="text-gray-500">
          {caption}
        </Typography>
      ) : null}
      <button
        onClick={() => mutate()}
        className="flex flex-row items-center gap-1 text-blue-600 text-sm"
        disabled={isPending}
      >
        {isPending ? <CircularProgress size={16} /> : <MdVisibility size={18} />}
        <span>Preview</span>
      </button>
    </div>
  );
};

export const MyDocumentsScreen = () => {
  const { data, isLoading, isError, error, refetch } =
    useQuery<MyDocumentsResponse>({
      queryKey: ["me", "documents"],
      queryFn: async () => {
        const result = await api.get<MyDocumentsResponse>("/me/documents");
        return result.data;
      },
    });

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  const { apartmentDocuments, rentalDocuments, invoiceDocuments } = data;

  const hasAny =
    apartmentDocuments.length +
      rentalDocuments.length +
      invoiceDocuments.length >
    0;

  return (
    <RouteContent>
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            My documents
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Documents related to your apartment, rental agreement and invoices
          </Typography>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-6 p-8">
        {!hasAny ? (
          <EmptyView message="No documents available yet" />
        ) : (
          <>
            <section className="flex flex-col gap-3">
              <Typography variant="h6" className="font-semibold">
                Apartment documents ({apartmentDocuments.length})
              </Typography>
              {apartmentDocuments.length === 0 ? (
                <Typography variant="body2" className="text-gray-500">
                  No documents uploaded for your apartment.
                </Typography>
              ) : (
                <div className="flex flex-row flex-wrap gap-3">
                  {apartmentDocuments.map((doc) => (
                    <DocumentTile key={doc} label={doc} filename={doc} />
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <Typography variant="h6" className="font-semibold">
                Rental documents ({rentalDocuments.length})
              </Typography>
              {rentalDocuments.length === 0 ? (
                <Typography variant="body2" className="text-gray-500">
                  No rental documents yet.
                </Typography>
              ) : (
                <div className="flex flex-row flex-wrap gap-3">
                  {rentalDocuments.map((doc) => (
                    <DocumentTile key={doc} label={doc} filename={doc} />
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-3">
              <Typography variant="h6" className="font-semibold">
                Invoice documents ({invoiceDocuments.length})
              </Typography>
              {invoiceDocuments.length === 0 ? (
                <Typography variant="body2" className="text-gray-500">
                  No invoice documents yet.
                </Typography>
              ) : (
                <div className="flex flex-row flex-wrap gap-3">
                  {invoiceDocuments.map((invoice) => (
                    <DocumentTile
                      key={invoice._id}
                      label={invoice.invoiceID}
                      filename={`${invoice.document}`}
                      caption={`Due ${dayjs(invoice.dueDate).format(
                        "DD.MM.YYYY"
                      )}`}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </RouteContent>
  );
};
