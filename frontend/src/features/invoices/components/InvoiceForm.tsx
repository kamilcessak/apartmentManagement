import { FC, useMemo } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import { MdUploadFile } from "react-icons/md";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import api from "@services/api";
import { ApartmentListType } from "@features/apartments/types/apartment.type";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

import { INVOICE_TYPES } from "../types";

export type InvoiceFormValues = {
  apartmentID: string;
  invoiceID: string;
  invoiceType: string;
  amount: number | null;
  dueDate: Date | null;
  document: string | null;
};

const schema = yup.object().shape({
  apartmentID: yup.string().required("Apartment is required"),
  invoiceID: yup.string().required("Invoice number is required"),
  invoiceType: yup.string().required("Type is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .positive("Amount must be greater than zero")
    .required("Amount is required"),
  dueDate: yup
    .date()
    .typeError("Due date is required")
    .required("Due date is required"),
  document: yup.string().nullable(),
});

type Props = {
  defaultValues: Partial<InvoiceFormValues>;
  apartments: ApartmentListType[];
  onSubmit: (values: InvoiceFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  isSubmitting?: boolean;
  lockApartment?: boolean;
};

export const InvoiceForm: FC<Props> = ({
  defaultValues,
  apartments,
  onSubmit,
  onCancel,
  submitLabel = "Save",
  isSubmitting = false,
  lockApartment = false,
}) => {
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
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: yupResolver(schema) as never,
    defaultValues: mergedDefaults,
  });

  const currentDocument = watch("document");

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
      toast("Document uploaded", { type: "success" });
    },
    onError: () => {
      toast("Failed to upload document", { type: "error" });
    },
  });

  const handleRemoveDocument = () => {
    setValue("document", null, { shouldValidate: true });
  };

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <FormControl fullWidth error={!!errors.apartmentID?.message}>
        <InputLabel id="invoice-apartment">Apartment</InputLabel>
        <Controller
          control={control}
          name="apartmentID"
          render={({ field, fieldState }) => (
            <>
              <Select
                labelId="invoice-apartment"
                label="Apartment"
                disabled={lockApartment || isSubmitting}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {apartments.map((apartment) => (
                  <MenuItem key={apartment._id} value={apartment._id}>
                    {getApartmentIdFromAddress(apartment.address)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{fieldState.error?.message}</FormHelperText>
            </>
          )}
        />
      </FormControl>

      <Controller
        control={control}
        name="invoiceID"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Invoice number"
            variant="outlined"
            disabled={isSubmitting}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <FormControl fullWidth error={!!errors.invoiceType?.message}>
        <InputLabel id="invoice-type">Type</InputLabel>
        <Controller
          control={control}
          name="invoiceType"
          render={({ field, fieldState }) => (
            <>
              <Select
                labelId="invoice-type"
                label="Type"
                disabled={isSubmitting}
                value={field.value ?? ""}
                onChange={(event) => field.onChange(event.target.value)}
              >
                {INVOICE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {capitalizeFirstLetter(type)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>{fieldState.error?.message}</FormHelperText>
            </>
          )}
        />
      </FormControl>

      <Controller
        control={control}
        name="amount"
        render={({ field, fieldState }) => (
          <TextField
            label="Amount (PLN)"
            variant="outlined"
            type="number"
            disabled={isSubmitting}
            value={field.value ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              field.onChange(raw === "" ? null : Number(raw));
            }}
            error={!!fieldState.error?.message}
            helperText={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="dueDate"
        render={({ field, fieldState }) => (
          <DatePicker
            label="Due date"
            disabled={isSubmitting}
            value={field.value ? dayjs(field.value) : null}
            onChange={(next) => field.onChange(next ? next.toDate() : null)}
            format="DD.MM.YYYY"
            slotProps={{
              textField: {
                error: !!fieldState.error,
                helperText: fieldState.error?.message,
              } as React.ComponentProps<typeof TextField>,
            }}
          />
        )}
      />

      <section className="flex flex-col gap-2 border-gray-300 rounded-md border p-4">
        <div className="flex flex-row items-center justify-between">
          <span className="text-gray-700">Invoice document (PDF)</span>
          <Button
            component="label"
            variant="outlined"
            color="success"
            size="small"
            disabled={isUploading || isSubmitting}
            startIcon={
              isUploading ? (
                <CircularProgress size={16} />
              ) : (
                <MdUploadFile />
              )
            }
            style={{ textTransform: "none" }}
          >
            {currentDocument ? "Replace" : "Upload PDF"}
            <input
              hidden
              type="file"
              accept="application/pdf"
              onChange={(event) => {
                if (event.target.files?.[0]) {
                  uploadDocument(event.target.files[0]);
                }
              }}
            />
          </Button>
        </div>
        {currentDocument ? (
          <div className="flex flex-row items-center justify-between">
            <span className="text-sm text-gray-600 truncate">
              {currentDocument}
            </span>
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={handleRemoveDocument}
              disabled={isSubmitting || isUploading}
              style={{ textTransform: "none" }}
            >
              Remove
            </Button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">No document attached.</span>
        )}
      </section>

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outlined"
          size="large"
          disabled={isSubmitting}
          onClick={onCancel}
          style={{ textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          color="success"
          size="large"
          variant="contained"
          disabled={isSubmitting || isUploading}
          startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          style={{ textTransform: "none" }}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
