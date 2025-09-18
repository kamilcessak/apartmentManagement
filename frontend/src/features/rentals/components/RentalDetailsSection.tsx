import { DetailsSectionHeader } from "@components/header";
import {
  Button,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "@services/api";
import { RentalType } from "../types/rental.types";
import { DetailsInformationItem } from "@components/sections";
import dayjs from "dayjs";
import { DatePicker } from "@mui/x-date-pickers";

const schema = yup.object().shape({
  startDate: yup.date().required("Field is required"),
  endDate: yup.date().required("Field is required"),
  rentalPaymentDay: yup.number().required("Field is required"),
  monthlyCost: yup.number().required("Field is required"),
  securityDeposit: yup.number().required("Field is required"),
});

type FormType = {
  startDate: Date | null;
  endDate: Date | null;
  rentalPaymentDay: number;
  monthlyCost: number;
  securityDeposit: number;
};

export const RentalDetailsSection = ({ rental }: { rental: RentalType }) => {
  const queryClient = useQueryClient();
  const [editMode, seteditMode] = useState(false);

  const defaultValues = useMemo(
    () => ({
      startDate: dayjs(rental.startDate),
      endDate: dayjs(rental.endDate),
      rentalPaymentDay: rental.rentalPaymentDay || 0,
      monthlyCost: rental.monthlyCost || 0,
      securityDeposit: rental.securityDeposit || 0,
    }),
    [rental]
  );

  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const handlePatchRental = async (formData: FormType) => {
    try {
      const result = await api.patch(`/rental/${rental._id}`, formData);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchRental,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${rental._id}`] });
      seteditMode(false);
      toast("Successfully modified rental details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying rental details", {
        type: "error",
      });
    },
  });

  const onSubmit = (data) => console.log(data);

  return (
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        editMode={editMode}
        editModeButton={
          <Button
            color="success"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress /> : null}
            onClick={handleSubmit(onSubmit)}
            style={{ textTransform: "none" }}
          >
            <Typography variant="body2">Save</Typography>
          </Button>
        }
        title={"Main informations"}
        onClickButton={() =>
          seteditMode((prev) => {
            if (!prev) {
              reset(defaultValues);
            }
            return !prev;
          })
        }
      />
      <Divider />
      <div className="flex flex-1 flex-row items-center gap-4 justify-between w-full">
        {!editMode ? (
          <>
            <DetailsInformationItem
              title={"Start date"}
              subtitle={dayjs(rental.startDate).format("DD.MM.YYYY")}
            />
            <DetailsInformationItem
              title={"End date"}
              subtitle={dayjs(rental.endDate).format("DD.MM.YYYY")}
            />
            <DetailsInformationItem
              title={"Rental payment day"}
              subtitle={`${rental.rentalPaymentDay}`}
            />
            <DetailsInformationItem
              title={"Security deposit"}
              subtitle={`${rental.securityDeposit}`}
            />
            <DetailsInformationItem
              title={"Monthly cost"}
              subtitle={`${rental.monthlyCost}`}
            />
          </>
        ) : (
          <div className="flex flex-col flex-1 gap-4">
            <Controller
              name="startDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Rental start date"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
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
            <Controller
              name="endDate"
              control={control}
              render={({ field, fieldState }) => (
                <DatePicker
                  label="Rental end date"
                  value={field.value}
                  onChange={(newValue) => field.onChange(newValue)}
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
            <Controller
              control={control}
              name="rentalPaymentDay"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Rental payment day"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  type="number"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="monthlyCost"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Monthly cost"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  type="number"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="securityDeposit"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Security deposit"
                  value={field.value}
                  onChange={field.onChange}
                  variant="outlined"
                  type="number"
                  error={!!fieldState.error?.message}
                  helperText={fieldState.error?.message}
                />
              )}
            />
          </div>
        )}
      </div>
    </section>
  );
};
