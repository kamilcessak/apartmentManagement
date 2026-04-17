import {
  Button as MuiButton,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import * as yup from "yup";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { DetailsSectionHeader } from "@components/header";

import { Card } from "@/components/ui/card";
import api from "@services/api";

const schema = yup.object().shape({
  description: yup.string().required("Field is required"),
});

type FormType = {
  description: string;
};

export const DetailsDescriptionSection = ({
  description,
  id,
}: {
  description: string;
  id: string;
}) => {
  const queryClient = useQueryClient();
  const [editMode, seteditMode] = useState(false);

  const { handleSubmit, control, reset } = useForm<FormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      description: description || "",
    },
  });

  const handlePatchApartment = async (formData: FormType) => {
    try {
      const result = await api.patch(`/apartment/${id}`, formData);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePatchApartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apartment", `${id}`] });
      seteditMode(false);
      toast("Successfully modified apartment details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying apartment details", {
        type: "error",
      });
    },
  });

  const onSubmit = (formData: FormType) => mutate(formData);

  return (
    <Card className="p-6 mb-6">
      <DetailsSectionHeader
        title={"Description"}
        editMode={editMode}
        editModeButton={
          <MuiButton
            color="success"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={16} /> : null}
            onClick={handleSubmit(onSubmit)}
            style={{ textTransform: "none" }}
          >
            <Typography variant="body2">Save</Typography>
          </MuiButton>
        }
        onClickButton={() =>
          seteditMode((prev) => {
            if (!prev) {
              reset({ description: description || "" });
            }
            return !prev;
          })
        }
      />
      <div className="mt-6">
        {!editMode ? (
          <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
            {description}
          </p>
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
    </Card>
  );
};
