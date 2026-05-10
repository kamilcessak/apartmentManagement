import { useMemo } from "react";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Loader2 } from "lucide-react";

import { RouteContent } from "@components/common";
import { Button } from "@components/ui/button";
import { Card, CardContent, CardFooter } from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Textarea } from "@components/ui/textarea";
import { cn } from "@/lib/utils";
import api from "@services/api";
import { FilesDropzone } from "@components/files";

const polishPostalCodePattern = /^\d{2}-\d{3}$/;

type FormValues = {
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  postalCode: string;
  city: string;
  metric: number;
  roomCount: number;
  monthlyCost: number;
  description: string;
  equipment?: string;
  photos?: string[];
  documents?: string[];
};

export const NewApartmentScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const schema = useMemo(
    () =>
      yup.object().shape({
        street: yup
          .string()
          .trim()
          .required(t("apartments.newApartment.validation.streetRequired")),
        buildingNumber: yup
          .string()
          .trim()
          .required(
            t("apartments.newApartment.validation.buildingNumberRequired")
          ),
        apartmentNumber: yup.string().trim(),
        postalCode: yup
          .string()
          .trim()
          .required(t("apartments.newApartment.validation.postalCodeRequired"))
          .matches(
            polishPostalCodePattern,
            t("apartments.newApartment.validation.postalCodeFormat")
          ),
        city: yup
          .string()
          .trim()
          .required(t("apartments.newApartment.validation.cityRequired")),
        metric: yup
          .number()
          .typeError(t("apartments.newApartment.validation.metricRequired"))
          .required(t("apartments.newApartment.validation.metricRequired")),
        roomCount: yup
          .number()
          .typeError(t("apartments.newApartment.validation.roomCountRequired"))
          .required(t("apartments.newApartment.validation.roomCountRequired")),
        monthlyCost: yup
          .number()
          .typeError(
            t("apartments.newApartment.validation.monthlyCostRequired")
          )
          .required(
            t("apartments.newApartment.validation.monthlyCostRequired")
          ),
        description: yup
          .string()
          .trim()
          .required(
            t("apartments.newApartment.validation.descriptionRequired")
          ),
        equipment: yup.string(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      street: "",
      buildingNumber: "",
      apartmentNumber: "",
      postalCode: "",
      city: "",
    },
  });

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

  const handlePostApartment = async (data: FormValues) => {
    const { apartmentNumber, ...rest } = data;
    const apt = (apartmentNumber ?? "").trim();
    const payload = {
      ...rest,
      ...(apt ? { apartmentNumber: apt } : {}),
    };
    const result = await api.post("/apartment", payload);
    return result;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePostApartment,
    onSuccess: (data) => {
      if (data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["apartments", "list"] });
        toast(t("apartments.newApartment.successToast"), { type: "success" });
        navigate(-1);
      }
    },
    onError: (error) => {
      console.error(error);
      toast(t("apartments.newApartment.errorToast"), { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  const renderError = (fieldId: string, message?: string) =>
    message ? (
      <p id={`${fieldId}-error`} className="text-xs text-destructive">
        {message}
      </p>
    ) : null;

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-4xl flex-col gap-6">
          <header className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={t("apartments.newApartment.back")}
              className="shrink-0 text-slate-600 hover:text-slate-900"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {t("apartments.newApartment.title")}
              </h1>
              <p className="text-sm text-slate-500">
                {t("apartments.newApartment.description")}
              </p>
            </div>
          </header>

          <Card className="rounded-xl border border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardContent className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3 lg:p-8">
                <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-3">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                    <div className="flex flex-col md:col-span-7">
                      <Label
                        htmlFor="street"
                        className="mb-1.5 text-sm font-medium text-slate-900"
                      >
                        {t("apartments.newApartment.fields.street.label")}
                      </Label>
                      <Input
                        id="street"
                        type="text"
                        autoComplete="address-line1"
                        placeholder={t(
                          "apartments.newApartment.fields.street.placeholder"
                        )}
                        aria-invalid={!!errors.street}
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          errors.street &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("street")}
                      />
                      {renderError("street", errors.street?.message)}
                    </div>
                    <div className="flex flex-col md:col-span-2">
                      <Label
                        htmlFor="buildingNumber"
                        className="mb-1.5 text-sm font-medium text-slate-900"
                      >
                        {t(
                          "apartments.newApartment.fields.buildingNumber.label"
                        )}
                      </Label>
                      <Input
                        id="buildingNumber"
                        type="text"
                        placeholder={t(
                          "apartments.newApartment.fields.buildingNumber.placeholder"
                        )}
                        aria-invalid={!!errors.buildingNumber}
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          errors.buildingNumber &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("buildingNumber")}
                      />
                      {renderError(
                        "buildingNumber",
                        errors.buildingNumber?.message
                      )}
                    </div>
                    <div className="flex flex-col md:col-span-3">
                      <Label
                        htmlFor="apartmentNumber"
                        className="mb-1.5 text-sm font-medium text-slate-900"
                      >
                        {t(
                          "apartments.newApartment.fields.apartmentNumber.label"
                        )}
                        <span className="ml-1 font-normal text-slate-500">
                          {t(
                            "apartments.newApartment.fields.apartmentNumber.optional"
                          )}
                        </span>
                      </Label>
                      <Input
                        id="apartmentNumber"
                        type="text"
                        placeholder={t(
                          "apartments.newApartment.fields.apartmentNumber.placeholder"
                        )}
                        aria-invalid={!!errors.apartmentNumber}
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          errors.apartmentNumber &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("apartmentNumber")}
                      />
                      {renderError(
                        "apartmentNumber",
                        errors.apartmentNumber?.message
                      )}
                    </div>
                    <div className="flex flex-col md:col-span-4">
                      <Label
                        htmlFor="postalCode"
                        className="mb-1.5 text-sm font-medium text-slate-900"
                      >
                        {t("apartments.newApartment.fields.postalCode.label")}
                      </Label>
                      <Input
                        id="postalCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        placeholder={t(
                          "apartments.newApartment.fields.postalCode.placeholder"
                        )}
                        maxLength={6}
                        aria-invalid={!!errors.postalCode}
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          errors.postalCode &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("postalCode")}
                      />
                      {renderError("postalCode", errors.postalCode?.message)}
                    </div>
                    <div className="flex flex-col md:col-span-8">
                      <Label
                        htmlFor="city"
                        className="mb-1.5 text-sm font-medium text-slate-900"
                      >
                        {t("apartments.newApartment.fields.city.label")}
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        autoComplete="address-level2"
                        placeholder={t(
                          "apartments.newApartment.fields.city.placeholder"
                        )}
                        aria-invalid={!!errors.city}
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          errors.city &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register("city")}
                      />
                      {renderError("city", errors.city?.message)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="metric"
                    className="mb-1.5 text-sm font-medium text-slate-900"
                  >
                    {t("apartments.newApartment.fields.metric.label")}
                  </Label>
                  <Input
                    id="metric"
                    type="number"
                    inputMode="decimal"
                    placeholder={t(
                      "apartments.newApartment.fields.metric.placeholder"
                    )}
                    aria-invalid={!!errors.metric}
                    disabled={isPending}
                    className={cn(
                      "placeholder:text-slate-400",
                      errors.metric &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("metric")}
                  />
                  {renderError("metric", errors.metric?.message)}
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="roomCount"
                    className="mb-1.5 text-sm font-medium text-slate-900"
                  >
                    {t("apartments.newApartment.fields.roomCount.label")}
                  </Label>
                  <Input
                    id="roomCount"
                    type="number"
                    inputMode="numeric"
                    placeholder={t(
                      "apartments.newApartment.fields.roomCount.placeholder"
                    )}
                    aria-invalid={!!errors.roomCount}
                    disabled={isPending}
                    className={cn(
                      "placeholder:text-slate-400",
                      errors.roomCount &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("roomCount")}
                  />
                  {renderError("roomCount", errors.roomCount?.message)}
                </div>

                <div className="flex flex-col">
                  <Label
                    htmlFor="monthlyCost"
                    className="mb-1.5 text-sm font-medium text-slate-900"
                  >
                    {t("apartments.newApartment.fields.monthlyCost.label")}
                  </Label>
                  <Input
                    id="monthlyCost"
                    type="number"
                    inputMode="decimal"
                    placeholder={t(
                      "apartments.newApartment.fields.monthlyCost.placeholder"
                    )}
                    aria-invalid={!!errors.monthlyCost}
                    disabled={isPending}
                    className={cn(
                      "placeholder:text-slate-400",
                      errors.monthlyCost &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("monthlyCost")}
                  />
                  {renderError("monthlyCost", errors.monthlyCost?.message)}
                </div>

                <div className="flex flex-col md:col-span-2 lg:col-span-3">
                  <Label
                    htmlFor="description"
                    className="mb-1.5 text-sm font-medium text-slate-900"
                  >
                    {t("apartments.newApartment.fields.description.label")}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={t(
                      "apartments.newApartment.fields.description.placeholder"
                    )}
                    aria-invalid={!!errors.description}
                    disabled={isPending}
                    className={cn(
                      "min-h-[100px] placeholder:text-slate-400",
                      errors.description &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("description")}
                  />
                  {renderError("description", errors.description?.message)}
                </div>

                <div className="flex flex-col md:col-span-2 lg:col-span-3">
                  <Label
                    htmlFor="equipment"
                    className="mb-1.5 text-sm font-medium text-slate-900"
                  >
                    {t("apartments.newApartment.fields.equipment.label")}
                  </Label>
                  <Textarea
                    id="equipment"
                    placeholder={t(
                      "apartments.newApartment.fields.equipment.placeholder"
                    )}
                    aria-invalid={!!errors.equipment}
                    disabled={isPending}
                    className={cn(
                      "min-h-[100px] placeholder:text-slate-400",
                      errors.equipment &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    {...register("equipment")}
                  />
                  {renderError("equipment", errors.equipment?.message)}
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <FilesDropzone
                    title={t("apartments.newApartment.uploads.photosTitle")}
                    dropzoneTitle={t(
                      "apartments.newApartment.uploads.dropzoneTitle"
                    )}
                    dropzoneHint={t(
                      "apartments.newApartment.uploads.dropzoneHint"
                    )}
                    uploadingLabel={t(
                      "apartments.newApartment.uploads.uploading"
                    )}
                    uploadSuccessSingle={t(
                      "apartments.newApartment.uploads.uploadSuccessSingle"
                    )}
                    uploadSuccessBatch={t(
                      "apartments.newApartment.uploads.uploadSuccessBatch"
                    )}
                    uploadError={t(
                      "apartments.newApartment.uploads.uploadError"
                    )}
                    accept="image/*"
                    disabled={isPending}
                    handleAddForm={handleAddPhotoToForm}
                    handleRemoveForm={handleRemovePhotoFromForm}
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <FilesDropzone
                    title={t("apartments.newApartment.uploads.documentsTitle")}
                    dropzoneTitle={t(
                      "apartments.newApartment.uploads.dropzoneTitle"
                    )}
                    dropzoneHint={t(
                      "apartments.newApartment.uploads.dropzoneHint"
                    )}
                    uploadingLabel={t(
                      "apartments.newApartment.uploads.uploading"
                    )}
                    uploadSuccessSingle={t(
                      "apartments.newApartment.uploads.uploadSuccessSingle"
                    )}
                    uploadSuccessBatch={t(
                      "apartments.newApartment.uploads.uploadSuccessBatch"
                    )}
                    uploadError={t(
                      "apartments.newApartment.uploads.uploadError"
                    )}
                    accept=".pdf,application/pdf"
                    disabled={isPending}
                    handleAddForm={handleAddDocumentToForm}
                    handleRemoveForm={handleRemoveDocumentFromForm}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4 border-t border-slate-100 p-6 lg:px-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                >
                  {t("apartments.newApartment.cancel")}
                </Button>
                <Button type="submit" variant="default" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("apartments.newApartment.submit")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </RouteContent>
  );
};
