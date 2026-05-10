import { FC, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import {
  FileText,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";

import api from "@services/api";
import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { getApartmentShortLabel } from "@utils/apartment";

import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { INVOICE_TYPES, InvoiceCategory } from "../types";

export type InvoiceFormValues = {
  apartmentID: string;
  invoiceID: string;
  invoiceType: string;
  amount: number | null;
  dueDate: Date | null;
  document: string | null;
};

const buildSchema = (t: TFunction) =>
  yup.object().shape({
    apartmentID: yup
      .string()
      .required(t("invoices.form.validation.apartmentRequired")),
    invoiceID: yup
      .string()
      .required(t("invoices.form.validation.invoiceNumberRequired")),
    invoiceType: yup
      .string()
      .required(t("invoices.form.validation.typeRequired")),
    amount: yup
      .number()
      .typeError(t("invoices.form.validation.amountType"))
      .positive(t("invoices.form.validation.amountPositive"))
      .required(t("invoices.form.validation.amountRequired")),
    dueDate: yup
      .date()
      .typeError(t("invoices.form.validation.dueDateRequired"))
      .required(t("invoices.form.validation.dueDateRequired")),
    document: yup.string().nullable(),
  });

type Props = {
  defaultValues: Partial<InvoiceFormValues>;
  apartments: ApartmentListType[];
  onSubmit: (values: InvoiceFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  lockApartment?: boolean;
};

const toDateInputValue = (value: Date | null | undefined): string => {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
};

export const InvoiceForm: FC<Props> = ({
  defaultValues,
  apartments,
  onSubmit,
  onCancel,
  submitLabel,
  cancelLabel,
  isSubmitting = false,
  lockApartment = false,
}) => {
  const { t } = useTranslation();

  const schema = useMemo(() => buildSchema(t), [t]);

  const mergedDefaults = useMemo<InvoiceFormValues>(
    () => ({
      apartmentID: defaultValues.apartmentID ?? "",
      invoiceID: defaultValues.invoiceID ?? "",
      invoiceType: defaultValues.invoiceType ?? "rent",
      amount: defaultValues.amount ?? null,
      dueDate: defaultValues.dueDate ?? null,
      document: defaultValues.document ?? null,
    }),
    [defaultValues]
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
  } = useForm<InvoiceFormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: mergedDefaults,
  });

  const currentDocument = watch("document");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleUploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data as { fileName: string; url?: string };
  };

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    mutationFn: handleUploadFile,
    onSuccess: (data) => {
      setValue("document", data.fileName, { shouldValidate: true });
      toast(t("invoices.form.upload.uploadSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("invoices.form.upload.uploadError"), { type: "error" });
    },
  });

  const handleRemoveDocument = () => {
    setValue("document", null, { shouldValidate: true });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.type !== "application/pdf") {
      toast(t("invoices.form.upload.onlyPdf"), { type: "error" });
      return;
    }
    uploadDocument(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragActive) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
  };

  const resolvedSubmitLabel =
    submitLabel ?? t("invoices.newInvoice.submit");
  const resolvedCancelLabel =
    cancelLabel ?? t("invoices.newInvoice.cancel");

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <CardContent className="min-w-0 p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
          <Controller
            control={control}
            name="apartmentID"
            render={({ field, fieldState }) => (
              <div className="grid gap-2 md:col-span-3">
                <Label
                  htmlFor="apartmentID"
                  className="font-medium text-slate-900"
                >
                  {t("invoices.form.fields.apartment.label")}
                </Label>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={lockApartment || isSubmitting}
                >
                  <SelectTrigger id="apartmentID">
                    <SelectValue
                      placeholder={t(
                        "invoices.form.fields.apartment.placeholder"
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {apartments.map((apartment) => (
                      <SelectItem key={apartment._id} value={apartment._id}>
                        {getApartmentShortLabel(apartment)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            name="invoiceID"
            render={({ field, fieldState }) => (
              <div className="grid gap-2 md:col-span-3">
                <Label
                  htmlFor="invoiceID"
                  className="font-medium text-slate-900"
                >
                  {t("invoices.form.fields.invoiceNumber.label")}
                </Label>
                <Input
                  id="invoiceID"
                  type="text"
                  placeholder={t(
                    "invoices.form.fields.invoiceNumber.placeholder"
                  )}
                  disabled={isSubmitting}
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

          <Controller
            control={control}
            name="invoiceType"
            render={({ field, fieldState }) => (
              <div className="grid gap-2 md:col-span-2">
                <Label
                  htmlFor="invoiceType"
                  className="font-medium text-slate-900"
                >
                  {t("invoices.form.fields.type.label")}
                </Label>
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="invoiceType">
                    <SelectValue
                      placeholder={t("invoices.form.fields.type.placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(`invoices.types.${type as InvoiceCategory}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            name="amount"
            render={({ field, fieldState }) => (
              <div className="grid gap-2 md:col-span-2">
                <Label
                  htmlFor="amount"
                  className="font-medium text-slate-900"
                >
                  {t("invoices.form.fields.amount.label")}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step="0.01"
                  disabled={isSubmitting}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const raw = event.target.value;
                    field.onChange(raw === "" ? null : Number(raw));
                  }}
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

          <Controller
            control={control}
            name="dueDate"
            render={({ field, fieldState }) => (
              <div className="grid gap-2 md:col-span-2">
                <Label
                  htmlFor="dueDate"
                  className="font-medium text-slate-900"
                >
                  {t("invoices.form.fields.dueDate.label")}
                </Label>
                <Input
                  id="dueDate"
                  type="date"
                  disabled={isSubmitting}
                  value={toDateInputValue(field.value)}
                  onChange={(event) =>
                    field.onChange(
                      event.target.value ? new Date(event.target.value) : null
                    )
                  }
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

          <div className="grid gap-2 md:col-span-6">
            <Label className="font-medium text-slate-900">
              {t("invoices.form.upload.label")}
            </Label>
            <div
              role="button"
              tabIndex={0}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed px-6 py-10 text-center transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              } ${isSubmitting || isUploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              ) : (
                <UploadCloud className="h-8 w-8 text-slate-400" />
              )}
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-900">
                  {t("invoices.form.upload.dragDropTitle")}
                </p>
                <p className="text-xs text-slate-500">
                  {t("invoices.form.upload.dragDropHint")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploading || isSubmitting}
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <UploadCloud className="h-4 w-4" />
                {t("invoices.form.upload.button")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(event) => {
                  handleFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </div>
            {currentDocument ? (
              <div className="flex min-w-0 items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  <FileText className="h-4 w-4 shrink-0 text-slate-500" />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                    {currentDocument}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveDocument}
                  disabled={isSubmitting || isUploading}
                  className="shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("invoices.form.upload.remove")}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-4 border-t border-slate-100 px-6 py-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          {resolvedCancelLabel}
        </Button>
        <Button
          type="submit"
          variant="default"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {resolvedSubmitLabel}
        </Button>
      </CardFooter>
    </form>
  );
};
