import { FC, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Download,
  Eye,
  FileText,
  Home,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import {
  ErrorView,
  LoadingView,
  RouteContent,
} from "@components/common";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@services/api";
import { formatApartmentFullAddress } from "@utils/apartment";
import { getPublicUploadsFileUrl } from "@utils/uploadsUrl";

import {
  FilePreviewModal,
  type FilePreviewVariant,
} from "@features/apartments/components/FilePreviewModal";

import { MyApartmentResponse } from "../types";

const InfoCell: FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 truncate">{value}</span>
  </div>
);

function getStoredFileDisplayName(storedKey: string): string {
  const uuidLen = 36;
  if (storedKey.length > uuidLen + 1 && storedKey[uuidLen] === "-") {
    return storedKey.slice(uuidLen + 1);
  }
  return storedKey;
}

function isLikelyImageFile(storedKey: string): boolean {
  return /\.(jpe?g|png|gif|webp)$/i.test(
    getStoredFileDisplayName(storedKey)
  );
}

function isPdfFile(storedKey: string): boolean {
  return /\.pdf$/i.test(getStoredFileDisplayName(storedKey));
}

function previewVariantForKey(fileKey: string): FilePreviewVariant {
  if (isLikelyImageFile(fileKey)) return "image";
  if (isPdfFile(fileKey)) return "pdf";
  return "other";
}

type PreviewState = {
  url: string;
  fileName: string;
  variant: FilePreviewVariant;
};

export const MyApartmentScreen = () => {
  const { t } = useTranslation();
  const tk = (key: string) => t(`dashboard.myApartment.${key}`);

  const [preview, setPreview] = useState<PreviewState | null>(null);

  const { data, isLoading, isError, error, refetch } =
    useQuery<MyApartmentResponse>({
      queryKey: ["me", "apartment"],
      queryFn: async () => {
        const result = await api.get<MyApartmentResponse>("/me/apartment");
        return result.data;
      },
      retry: false,
    });

  const resolveFileUrl = (fileKey: string) => {
    const trimmed = fileKey.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed.split("?")[0] ?? trimmed;
    }
    return getPublicUploadsFileUrl(fileKey);
  };

  const openPreview = (fileKey: string) => {
    try {
      const url = resolveFileUrl(fileKey);
      setPreview({
        url,
        fileName: getStoredFileDisplayName(fileKey),
        variant: previewVariantForKey(fileKey),
      });
    } catch {
      toast(tk("documents.previewOpenError"), { type: "error" });
    }
  };

  const triggerDownload = (fileKey: string) => {
    try {
      const url = resolveFileUrl(fileKey);
      const a = document.createElement("a");
      a.href = url;
      a.download = getStoredFileDisplayName(fileKey);
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast(tk("documents.previewOpenError"), { type: "error" });
    }
  };

  if (isLoading) return <LoadingView />;

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;
    if (status === 404) {
      return (
        <RouteContent>
          <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
            <header className="flex flex-row items-center px-8 py-5 border-b border-slate-200 bg-white">
              <div className="flex flex-col">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  {tk("title")}
                </h1>
                <p className="text-sm text-slate-500">{tk("subtitle")}</p>
              </div>
            </header>
            <main className="flex flex-1 items-center justify-center p-8">
              <div className="flex flex-col items-center text-center">
                <Home
                  className="text-slate-300"
                  size={64}
                  strokeWidth={1.6}
                />
                <p className="mt-4 text-lg font-medium text-slate-900">
                  {tk("emptyTitle")}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  {tk("emptyDescription")}
                </p>
              </div>
            </main>
          </div>
        </RouteContent>
      );
    }
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;
  }

  if (!data) {
    return (
      <RouteContent>
        <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
          <header className="flex flex-row items-center px-8 py-5 border-b border-slate-200 bg-white">
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {tk("title")}
              </h1>
              <p className="text-sm text-slate-500">{tk("subtitle")}</p>
            </div>
          </header>
          <main className="flex flex-1 items-center justify-center p-8">
            <div className="flex flex-col items-center text-center">
              <Home
                className="text-slate-300"
                size={64}
                strokeWidth={1.6}
              />
              <p className="mt-4 text-lg font-medium text-slate-900">
                {tk("emptyTitle")}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {tk("emptyDescription")}
              </p>
            </div>
          </main>
        </div>
      </RouteContent>
    );
  }

  const { apartment, landlord, rental } = data;

  const photos = apartment.photos ?? [];
  const documents = rental?.documents ?? [];
  const landlordFullName =
    landlord?.firstName && landlord?.lastName
      ? `${landlord.firstName} ${landlord.lastName}`
      : tk("contact.unknown");

  const landlordAddress = [
    landlord?.street,
    landlord?.buildingNumber,
    landlord?.apartmentNumber ? `/ ${landlord.apartmentNumber}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  const landlordCityLine = [landlord?.postalCode, landlord?.city]
    .filter(Boolean)
    .join(" ");

  return (
    <RouteContent>
      <FilePreviewModal
        open={preview !== null}
        onClose={() => setPreview(null)}
        url={preview?.url ?? null}
        fileName={preview?.fileName ?? ""}
        variant={preview?.variant ?? "other"}
        closeLabel={tk("documents.previewClose")}
        iframeTitle={tk("documents.previewPdfFrameTitle")}
        documentPlaceholder={tk("documents.previewDocumentPlaceholder")}
        missingUrlMessage={tk("documents.previewOpenError")}
      />
      <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
        <header className="flex flex-row items-center px-8 py-5 border-b border-slate-200 bg-white">
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {tk("title")}
            </h1>
            <p className="text-sm text-slate-500">{tk("subtitle")}</p>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-6 w-full overflow-y-auto scrollbar-hide p-8">
          {/* Property information */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <CardTitle className="text-lg text-slate-900">
                {tk("information.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <InfoCell
                  label={tk("information.address")}
                  value={formatApartmentFullAddress(apartment)}
                />
                <InfoCell
                  label={tk("information.metric")}
                  value={`${apartment.metric} ${tk("information.metricSuffix")}`}
                />
                <InfoCell
                  label={tk("information.roomsCount")}
                  value={`${apartment.roomCount}`}
                />
                <InfoCell
                  label={tk("information.monthlyCost")}
                  value={`${apartment.monthlyCost} zł`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {apartment.description ? (
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                <CardTitle className="text-lg text-slate-900">
                  {tk("description.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
                  {apartment.description}
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Landlord contact */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <CardTitle className="text-lg text-slate-900">
                {tk("contact.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {landlord ? (
                <div className="flex items-start gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100">
                    <UserRound className="text-slate-500" size={20} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <InfoCell
                      label={tk("contact.name")}
                      value={landlordFullName}
                    />
                    {landlord.phoneNumber ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone size={16} className="shrink-0" />
                        <span className="text-sm">{landlord.phoneNumber}</span>
                      </div>
                    ) : null}
                    {landlord.email ? (
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail size={16} className="shrink-0" />
                        <span className="text-sm">{landlord.email}</span>
                      </div>
                    ) : null}
                    {landlordAddress ? (
                      <InfoCell
                        label={tk("contact.address")}
                        value={
                          <>
                            {landlordAddress}
                            {landlordCityLine ? (
                              <>
                                <br />
                                {landlordCityLine}
                              </>
                            ) : null}
                          </>
                        }
                      />
                    ) : null}
                    {landlord.bankAccountIban ? (
                      <InfoCell
                        label={tk("contact.bankAccount")}
                        value={
                          <>
                            {landlord.bankAccountIban}
                            {landlord.bankName ? (
                              <span className="text-slate-500 font-normal">
                                {" "}
                                ({landlord.bankName})
                              </span>
                            ) : null}
                          </>
                        }
                      />
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  {tk("contact.unknown")}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <CardTitle className="text-lg text-slate-900">
                {tk("photos.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {photos.length === 0 ? (
                <p className="text-sm text-slate-500">{tk("photos.empty")}</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {photos.map((photo, index) => (
                    <button
                      key={photo}
                      type="button"
                      className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/80 transition-shadow hover:ring-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      onClick={() => openPreview(photo)}
                    >
                      <img
                        src={getPublicUploadsFileUrl(photo)}
                        alt={`${tk("photos.title")} ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-900/0 transition-colors group-hover:bg-slate-900/20">
                        <Eye className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
              <CardTitle className="text-lg text-slate-900">
                {tk("documents.leaseTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              {documents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  {tk("documents.leaseEmpty")}
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {documents.map((fileKey) => {
                    const displayName = getStoredFileDisplayName(fileKey);
                    const pdf = isPdfFile(fileKey);
                    const iconColor = pdf
                      ? "text-blue-600"
                      : "text-slate-500";

                    return (
                      <div
                        key={fileKey}
                        className="flex flex-row items-center gap-3 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 transition-colors hover:bg-slate-50"
                      >
                        <div
                          className={`flex size-9 shrink-0 items-center justify-center rounded-md bg-white ring-1 ring-slate-200/80 ${iconColor}`}
                          aria-hidden
                        >
                          <FileText
                            className="size-4"
                            strokeWidth={1.75}
                          />
                        </div>
                        <p
                          className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800"
                          title={displayName}
                        >
                          {displayName}
                        </p>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2 text-slate-600"
                            onClick={() => openPreview(fileKey)}
                          >
                            <Eye
                              className="size-3.5 shrink-0"
                              strokeWidth={2}
                            />
                            <span>{tk("documents.view")}</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 px-2 text-slate-600"
                            onClick={() => triggerDownload(fileKey)}
                          >
                            <Download
                              className="size-3.5 shrink-0"
                              strokeWidth={2}
                            />
                            <span>{tk("documents.download")}</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </RouteContent>
  );
};
