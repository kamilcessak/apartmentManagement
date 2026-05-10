import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Receipt,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";

import {
  EmptyView,
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import { Button } from "@/components/ui/button";
import api from "@services/api";
import { capitalizeFirstLetter } from "@utils/common";
import { getPublicUploadsFileUrl } from "@utils/uploadsUrl";

import {
  FilePreviewModal,
  type FilePreviewVariant,
} from "@features/apartments/components/FilePreviewModal";
import { InvoiceStatusChip } from "@features/invoices/components/InvoiceStatusChip";
import { InvoiceType } from "@features/invoices/types";
import { TenantTransferDetailsModal } from "../components";
import { MyApartmentResponse, MyInvoicesResponse } from "../types";

const formatCurrency = (value: number) =>
  `${value.toLocaleString("pl-PL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} PLN`;

const invoiceTypeLabels: Record<string, string> = {
  rent: "Czynsz",
  electricity: "Prąd",
  water: "Woda",
  gas: "Gaz",
  internet: "Internet",
  heating: "Ogrzewanie",
  garbage: "Śmieci",
  other: "Inne",
};

const getInvoiceTypeLabel = (invoiceType: string) =>
  invoiceTypeLabels[invoiceType] ?? capitalizeFirstLetter(invoiceType);

function getStoredFileDisplayName(storedKey: string): string {
  const uuidLen = 36;
  if (storedKey.length > uuidLen + 1 && storedKey[uuidLen] === "-") {
    return storedKey.slice(uuidLen + 1);
  }
  return storedKey;
}

function isLikelyImageFile(storedKey: string): boolean {
  const name = getStoredFileDisplayName(storedKey).toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(name);
}

function isPdfFile(storedKey: string): boolean {
  return /\.pdf$/i.test(getStoredFileDisplayName(storedKey));
}

function previewVariantForKey(fileKey: string): FilePreviewVariant {
  if (isLikelyImageFile(fileKey)) return "image";
  if (isPdfFile(fileKey)) return "pdf";
  return "other";
}

function uploadKeyFromDocument(document: string): string {
  if (document.includes("/uploads/")) {
    const part = document.split("/uploads/").pop() ?? document;
    return part.split("?")[0] ?? part;
  }
  return document;
}

function resolveInvoiceDocumentUrl(document: string): string {
  const trimmed = document.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed.split("?")[0] ?? trimmed;
  }
  return getPublicUploadsFileUrl(trimmed);
}

export const MyInvoicesScreen = () => {
  const { t } = useTranslation();
  const [documentPreview, setDocumentPreview] = useState<{
    url: string;
    fileName: string;
    variant: FilePreviewVariant;
  } | null>(null);
  const [payInvoice, setPayInvoice] = useState<InvoiceType | null>(null);

  const { data: apartmentContext } = useQuery<MyApartmentResponse>({
    queryKey: ["me", "apartment"],
    queryFn: async () => {
      const result = await api.get<MyApartmentResponse>("/me/apartment");
      return result.data;
    },
    retry: false,
  });

  const { data, isLoading, isError, error, refetch } =
    useQuery<MyInvoicesResponse>({
      queryKey: ["me", "invoices"],
      queryFn: async () => {
        const result = await api.get<MyInvoicesResponse>("/me/invoices");
        return result.data;
      },
    });

  const openDocumentPreview = (invoice: InvoiceType) => {
    const doc = invoice.document;
    if (!doc) {
      toast.error(t("tenantPortal.invoices.previewMissingFile"));
      return;
    }
    try {
      const key = uploadKeyFromDocument(doc);
      const url = resolveInvoiceDocumentUrl(doc);
      setDocumentPreview({
        url,
        fileName: `${invoice.invoiceID} — ${getStoredFileDisplayName(key)}`,
        variant: previewVariantForKey(key),
      });
    } catch {
      toast.error(t("tenantPortal.invoices.previewError"));
    }
  };

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  const { invoices, summary } = data;
  const landlord = apartmentContext?.landlord ?? null;

  return (
    <RouteContent>
      <TenantTransferDetailsModal
        open={payInvoice !== null}
        onClose={() => setPayInvoice(null)}
        landlord={landlord}
        transferTitle={payInvoice?.invoiceID ?? ""}
        amountFormatted={
          payInvoice ? formatCurrency(payInvoice.amount) : undefined
        }
      />
      <FilePreviewModal
        open={documentPreview !== null}
        onClose={() => setDocumentPreview(null)}
        url={documentPreview?.url ?? null}
        fileName={documentPreview?.fileName ?? ""}
        variant={documentPreview?.variant ?? "other"}
        closeLabel={t("dashboard.myApartment.documents.previewClose")}
        iframeTitle={t("dashboard.myApartment.documents.previewPdfFrameTitle")}
        documentPlaceholder={t(
          "dashboard.myApartment.documents.previewDocumentPlaceholder"
        )}
        missingUrlMessage={t("tenantPortal.invoices.previewError")}
      />
      <header className="flex flex-row items-center justify-between p-8 border-b-2 border-gray-200">
        <div className="flex flex-col">
          <Typography variant="h4" className="font-semibold">
            {t("navigation.myInvoices")}
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            {t("tenantPortal.invoices.subtitle")}
          </Typography>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-6 p-8">
        {summary ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {t("tenantPortal.invoices.summaryTotal")}
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-600">
                  <Wallet className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.total)}
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {t("tenantPortal.invoices.summaryPaid")}
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <CheckCircle className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.paidAmount)}
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {t("tenantPortal.invoices.summaryUnpaid")}
                </p>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                  <Clock className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {formatCurrency(summary.unpaidAmount)}
              </p>
            </div>
            <div className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-gray-500">
                    {t("tenantPortal.invoices.summaryOverdue")}
                  </p>
                  <span className="inline-flex items-center justify-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600 tabular-nums">
                    ({summary.overdueCount})
                  </span>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <AlertTriangle className="h-5 w-5" strokeWidth={1.75} />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.overdueAmount)}
              </p>
            </div>
          </section>
        ) : null}

        {invoices.length === 0 ? (
          <EmptyView message={t("tenantPortal.invoices.empty")} />
        ) : (
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex flex-col divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div
                  key={invoice._id}
                  className="flex flex-col gap-4 p-5 hover:bg-gray-50 transition-colors sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <Receipt className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {invoice.invoiceID}
                        </span>
                        <span className="shrink-0">
                          <InvoiceStatusChip invoice={invoice} />
                        </span>
                      </div>
                      <p className="truncate text-sm text-gray-500">
                        {getInvoiceTypeLabel(invoice.invoiceType)} •{" "}
                        {t("tenantPortal.invoices.due")}{" "}
                        {dayjs(invoice.dueDate).format("DD.MM.YYYY")}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
                    <span className="text-base font-bold text-gray-900 sm:mr-2">
                      {formatCurrency(invoice.amount)}
                    </span>
                    {!invoice.isPaid ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setPayInvoice(invoice)}
                      >
                        {t("tenantPortal.invoices.pay")}
                      </Button>
                    ) : null}
                    {invoice.document ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => openDocumentPreview(invoice)}
                      >
                        <Eye className="size-4" />
                        {t("tenantPortal.invoices.preview")}
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </RouteContent>
  );
};
