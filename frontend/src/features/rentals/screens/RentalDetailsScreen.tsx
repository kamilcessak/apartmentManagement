import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import api from "@services/api";
import { ErrorView, LoadingView, RouteContent } from "@components/common";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

import { RentalType } from "../types/rental.types";
import { DetailsFilesSection, RentalDetailsSection } from "../components";
import { RentalInfoSection } from "../components/RentalInfoSection";

type EndRentalDialogProps = {
  open: boolean;
  isLoading: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const EndRentalDialog = ({
  open,
  isLoading,
  title,
  description,
  cancelLabel,
  confirmLabel,
  onCancel,
  onConfirm,
}: EndRentalDialogProps) => {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-md border-slate-200 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="mt-2 text-sm text-slate-500">{description}</p>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t border-slate-100 p-6 pt-4">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            {confirmLabel}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export const RentalDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleGetRental = async () => {
    const result = await api.get<RentalType>(`/rental/${id}`);
    return result.data;
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rental", `${id}`],
    queryFn: handleGetRental,
  });

  const { mutate: endRental, isPending: isEnding } = useMutation({
    mutationFn: async () => {
      const result = await api.post(`/rental/${id}/end`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${id}`] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast(t("rentals.rentalDetails.endSuccessToast"), { type: "success" });
      setConfirmOpen(false);
    },
    onError: () => {
      toast(t("rentals.rentalDetails.endErrorToast"), { type: "error" });
    },
  });

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  return (
    <RouteContent>
      <div className="flex h-full flex-col bg-slate-50">
        <header className="flex flex-row items-center justify-between gap-3 border-b border-slate-200 bg-white px-8 py-6">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={t("rentals.rentalDetails.back")}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">
                {t("rentals.rentalDetails.title")}
              </h1>
              {data.isActive ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600/90">
                  {t("rentals.rentalDetails.status.active")}
                </Badge>
              ) : (
                <Badge variant="secondary">
                  {t("rentals.rentalDetails.status.ended")}
                </Badge>
              )}
            </div>
          </div>

          {data.isActive ? (
            <Button
              variant="destructive"
              disabled={isEnding}
              onClick={() => setConfirmOpen(true)}
            >
              {isEnding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {t("rentals.rentalDetails.endRental")}
            </Button>
          ) : null}
        </header>

        <main className="flex flex-1 flex-col gap-4 overflow-y-auto px-8 py-6">
          <RentalDetailsSection rental={data} />
          <RentalInfoSection rental={data} />
          <DetailsFilesSection
            files={data.photos}
            id={data._id}
            type="photos"
            title={t("rentals.rentalDetails.files.photos")}
          />
          <DetailsFilesSection
            title={t("rentals.rentalDetails.files.documents")}
            files={data.documents}
            id={data._id}
            type="documents"
          />
        </main>
      </div>

      <EndRentalDialog
        open={confirmOpen}
        isLoading={isEnding}
        title={t("rentals.rentalDetails.confirmEnd.title")}
        description={t("rentals.rentalDetails.confirmEnd.description")}
        cancelLabel={t("rentals.rentalDetails.confirmEnd.cancel")}
        confirmLabel={t("rentals.rentalDetails.confirmEnd.confirm")}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => endRental()}
      />
    </RouteContent>
  );
};
