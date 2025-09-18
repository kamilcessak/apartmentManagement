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

const schema = yup.object().shape({
  description: yup.string().required("Field is required"),
});

type FormType = {
  description: string;
};

export const RentalInfoSection = ({ rental }: { rental: RentalType }) => {
  const queryClient = useQueryClient();
  const [editMode, seteditMode] = useState(false);

  const defaultValues = useMemo(
    () => ({
      description: rental.description || "",
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

  const onSubmit = (data: FormType) => mutate(data);

  return (
    <section
      className={`flex flex-col gap-4 border-2 ${
        editMode ? "border-green-600" : "border-gray-700"
      } rounded-md p-4`}
    >
      <DetailsSectionHeader
        title={"Description"}
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
        onClickButton={() =>
          seteditMode((prev) => {
            if (!prev) {
              reset({ description: rental.description || "" });
            }
            return !prev;
          })
        }
      />
      <Divider />
      <div className="flex flex-1 w-full">
        {!editMode ? (
          <Typography className="whitespace-pre-line" variant="body1">
            {rental.description}
          </Typography>
        ) : (
          <div className="flex flex-1 flex-col">
            <Controller
              control={control}
              name="description"
              render={({ field, fieldState }) => (
                <TextField
                  disabled={isPending}
                  label="Description"
                  value={field.value}
                  multiline
                  onChange={field.onChange}
                  variant="outlined"
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
