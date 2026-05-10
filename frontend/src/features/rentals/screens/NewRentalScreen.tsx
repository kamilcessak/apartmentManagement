import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { FilesDropzone } from "@components/files";
import api from "@services/api";

import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { TenantsListType } from "@features/tenants/types/tenant.type";
import { getApartmentShortLabel } from "@utils/apartment";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const buildSchema = (t: TFunction) =>
  yup.object().shape({
    apartmentID: yup
      .string()
      .required(t("rentals.newRental.validation.apartmentRequired")),
    tenantID: yup
      .string()
      .required(t("rentals.newRental.validation.tenantRequired")),
    startDate: yup
      .date()
      .typeError(t("rentals.newRental.validation.startDateRequired"))
      .required(t("rentals.newRental.validation.startDateRequired")),
    endDate: yup
      .date()
      .typeError(t("rentals.newRental.validation.endDateRequired"))
      .required(t("rentals.newRental.validation.endDateRequired")),
    rentalPaymentDay: yup
      .number()
      .typeError(t("rentals.newRental.validation.paymentDayRequired"))
      .required(t("rentals.newRental.validation.paymentDayRequired")),
    monthlyCost: yup
      .number()
      .typeError(t("rentals.newRental.validation.monthlyCostRequired"))
      .required(t("rentals.newRental.validation.monthlyCostRequired")),
    securityDeposit: yup
      .number()
      .typeError(t("rentals.newRental.validation.securityDepositRequired"))
      .required(t("rentals.newRental.validation.securityDepositRequired")),
    description: yup
      .string()
      .required(t("rentals.newRental.validation.descriptionRequired")),
  });

type FormValues = {
  apartmentID: string;
  tenantID: string;
  startDate: Date | null | string;
  endDate: Date | null | string;
  rentalPaymentDay: number | null;
  monthlyCost: number | null;
  securityDeposit: number | null;
  description: string;
  documents?: string[];
  photos?: string[];
};

const toDateInputValue = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  if (typeof value === "string") {
    if (value.length >= 10) return value.slice(0, 10);
    return value;
  }
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

const toIsoString = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString();
};

export const NewRentalScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const schema = useMemo(() => buildSchema(t), [t]);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: {
      apartmentID: "",
      tenantID: "",
      startDate: null,
      endDate: null,
      rentalPaymentDay: null,
      monthlyCost: null,
      securityDeposit: null,
      description: "",
    },
  });

  const handlePostRental = async (data: FormValues) => {
    try {
      const result = await api.post("/rental", data);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetApartmentsList = async () => {
    try {
      const result = await api.get<ApartmentListType[]>("/apartmentsList");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleGetTenantsList = async () => {
    try {
      const result = await api.get<TenantsListType[]>("/tenantsList");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const handleAddPhotoToForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    setValue("photos", [...currentPhotos, url]);
  };

  const handleRemovePhotoFromForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    setValue(
      "photos",
      currentPhotos.filter((e) => e !== url)
    );
  };

  const handleAddDocumentToForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    setValue("documents", [...currentDocuments, url]);
  };

  const handleRemoveDocumentFromForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    setValue(
      "documents",
      currentDocuments.filter((e) => e !== url)
    );
  };

  const {
    data: apartmentsList,
    isLoading: isApartmentsListLoading,
    isError: isApartmentsListError,
    error: apartmentsListError,
    refetch: refetchApartmentsList,
  } = useQuery({
    queryKey: ["apartments", "ids", "LIST"],
    queryFn: handleGetApartmentsList,
  });

  const {
    data: tenantsList,
    isLoading: isTenantsListLoading,
    isError: isTenantsListError,
    error: tenantsListError,
    refetch: refetchTenantsList,
  } = useQuery({
    queryKey: ["tenants", "ids", "LIST"],
    queryFn: handleGetTenantsList,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: handlePostRental,
    onSuccess: (data) => {
      if (data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["rentals", "list"] });
        queryClient.invalidateQueries({ queryKey: ["apartments"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        toast(t("rentals.newRental.successToast"), { type: "success" });
        navigate(-1);
      }
    },
    onError: (err) => {
      const axiosError = err as AxiosError<{ error?: string }>;
      if (axiosError.response?.status === 409) {
        toast(
          axiosError.response.data?.error ??
            t("rentals.newRental.conflictFallbackToast"),
          { type: "error" }
        );
        return;
      }
      toast(t("rentals.newRental.errorToast"), { type: "error" });
    },
  });

  const onSubmit = ({ startDate, endDate, ...data }: FormValues) => {
    mutate({
      ...data,
      startDate: toIsoString(startDate),
      endDate: toIsoString(endDate),
    });
  };

  const isAnyLoading = useMemo(
    () => isApartmentsListLoading || isTenantsListLoading,
    [isApartmentsListLoading, isTenantsListLoading]
  );

  const isAnyError = useMemo(
    () => isApartmentsListError || isTenantsListError,
    [isApartmentsListError, isTenantsListError]
  );

  const refetchEverything = useCallback(async () => {
    await Promise.all([refetchApartmentsList(), refetchTenantsList()]);
  }, [refetchApartmentsList, refetchTenantsList]);

  if (isAnyLoading) return <LoadingView />;
  if (isAnyError)
    return (
      <ErrorView
        message={`${apartmentsListError?.message} \n ${tenantsListError?.message}`}
        onClick={refetchEverything}
      />
    );

  return (
    <RouteContent>
      <div className="flex h-full flex-col bg-slate-50">
        <header className="flex flex-row items-center gap-3 px-8 py-6">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label={t("rentals.newRental.back")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold text-slate-900">
              {t("rentals.newRental.title")}
            </h1>
            <p className="text-sm text-slate-500">
              {t("rentals.newRental.description")}
            </p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto w-full max-w-4xl"
          >
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="grid gap-6 p-6">
                {apartmentsList?.length ? (
                  <div className="grid gap-2">
                    <Label htmlFor="apartmentID" className="text-slate-900">
                      {t("rentals.newRental.fields.apartment.label")}
                    </Label>
                    <Controller
                      control={control}
                      name="apartmentID"
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          >
                            <SelectTrigger id="apartmentID">
                              <SelectValue
                                placeholder={t(
                                  "rentals.newRental.fields.apartment.placeholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {apartmentsList.map((e) => (
                                <SelectItem key={e._id} value={e._id}>
                                  {getApartmentShortLabel(e)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.error?.message ? (
                            <p className="text-xs text-destructive">
                              {fieldState.error.message}
                            </p>
                          ) : null}
                        </>
                      )}
                    />
                  </div>
                ) : null}

                {tenantsList?.length ? (
                  <div className="grid gap-2">
                    <Label htmlFor="tenantID" className="text-slate-900">
                      {t("rentals.newRental.fields.tenant.label")}
                    </Label>
                    <Controller
                      control={control}
                      name="tenantID"
                      render={({ field, fieldState }) => (
                        <>
                          <Select
                            value={field.value || undefined}
                            onValueChange={field.onChange}
                            disabled={isPending}
                          >
                            <SelectTrigger id="tenantID">
                              <SelectValue
                                placeholder={t(
                                  "rentals.newRental.fields.tenant.placeholder"
                                )}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {tenantsList.map((e) => (
                                <SelectItem key={e._id} value={e._id}>
                                  {`${e.firstName} ${e.lastName}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fieldState.error?.message ? (
                            <p className="text-xs text-destructive">
                              {fieldState.error.message}
                            </p>
                          ) : null}
                        </>
                      )}
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="startDate" className="text-slate-900">
                          {t("rentals.newRental.fields.startDate.label")}
                        </Label>
                        <Input
                          id="startDate"
                          type="date"
                          disabled={isPending}
                          value={toDateInputValue(field.value)}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          onBlur={field.onBlur}
                        />
                        {fieldState.error?.message ? (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="endDate"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="endDate" className="text-slate-900">
                          {t("rentals.newRental.fields.endDate.label")}
                        </Label>
                        <Input
                          id="endDate"
                          type="date"
                          disabled={isPending}
                          value={toDateInputValue(field.value)}
                          onChange={(e) => field.onChange(e.target.value || null)}
                          onBlur={field.onBlur}
                        />
                        {fieldState.error?.message ? (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Controller
                    control={control}
                    name="rentalPaymentDay"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-2">
                        <Label
                          htmlFor="rentalPaymentDay"
                          className="text-slate-900"
                        >
                          {t("rentals.newRental.fields.paymentDay.label")}
                        </Label>
                        <Input
                          id="rentalPaymentDay"
                          type="number"
                          min={1}
                          max={31}
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                          onBlur={field.onBlur}
                        />
                        {fieldState.error?.message ? (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="monthlyCost"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="monthlyCost" className="text-slate-900">
                          {t("rentals.newRental.fields.monthlyCost.label")}
                        </Label>
                        <Input
                          id="monthlyCost"
                          type="number"
                          min={0}
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                          onBlur={field.onBlur}
                        />
                        {fieldState.error?.message ? (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                  <Controller
                    control={control}
                    name="securityDeposit"
                    render={({ field, fieldState }) => (
                      <div className="grid gap-2">
                        <Label
                          htmlFor="securityDeposit"
                          className="text-slate-900"
                        >
                          {t("rentals.newRental.fields.securityDeposit.label")}
                        </Label>
                        <Input
                          id="securityDeposit"
                          type="number"
                          min={0}
                          disabled={isPending}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? null
                                : Number(e.target.value)
                            )
                          }
                          onBlur={field.onBlur}
                        />
                        {fieldState.error?.message ? (
                          <p className="text-xs text-destructive">
                            {fieldState.error.message}
                          </p>
                        ) : null}
                      </div>
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <div className="grid gap-2">
                      <Label htmlFor="description" className="text-slate-900">
                        {t("rentals.newRental.fields.description.label")}
                      </Label>
                      <Textarea
                        id="description"
                        rows={4}
                        className="min-h-[120px]"
                        disabled={isPending}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                      {fieldState.error?.message ? (
                        <p className="text-xs text-destructive">
                          {fieldState.error.message}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <FilesDropzone
                  title={t("rentals.newRental.uploads.photosTitle")}
                  dropzoneTitle={t(
                    "rentals.newRental.uploads.dropzoneTitle"
                  )}
                  dropzoneHint={t(
                    "rentals.newRental.uploads.dropzoneHintPhotos"
                  )}
                  uploadingLabel={t(
                    "rentals.newRental.uploads.uploading"
                  )}
                  uploadSuccessSingle={t(
                    "rentals.newRental.uploads.uploadSuccessSingle"
                  )}
                  uploadSuccessBatch={t(
                    "rentals.newRental.uploads.uploadSuccessBatch"
                  )}
                  uploadError={t(
                    "rentals.newRental.uploads.uploadError"
                  )}
                  accept="image/*"
                  disabled={isPending}
                  handleAddForm={handleAddPhotoToForm}
                  handleRemoveForm={handleRemovePhotoFromForm}
                />

                <FilesDropzone
                  title={t("rentals.newRental.uploads.documentsTitle")}
                  dropzoneTitle={t(
                    "rentals.newRental.uploads.dropzoneTitle"
                  )}
                  dropzoneHint={t(
                    "rentals.newRental.uploads.dropzoneHintDocuments"
                  )}
                  uploadingLabel={t(
                    "rentals.newRental.uploads.uploading"
                  )}
                  uploadSuccessSingle={t(
                    "rentals.newRental.uploads.uploadSuccessSingle"
                  )}
                  uploadSuccessBatch={t(
                    "rentals.newRental.uploads.uploadSuccessBatch"
                  )}
                  uploadError={t(
                    "rentals.newRental.uploads.uploadError"
                  )}
                  accept=".pdf,application/pdf"
                  disabled={isPending}
                  handleAddForm={handleAddDocumentToForm}
                  handleRemoveForm={handleRemoveDocumentFromForm}
                />
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                >
                  {t("rentals.newRental.cancel")}
                </Button>
                <Button type="submit" variant="default" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("rentals.newRental.submit")}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </RouteContent>
  );
};
