import * as yup from "yup";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Loader2, Pencil, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  const [editMode, setEditMode] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormType>({
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
      setEditMode(false);
      toast("Successfully modified apartment details", { type: "success" });
    },
    onError: () => {
      toast("An error occurred during modifying apartment details", {
        type: "error",
      });
    },
  });

  const handleToggleEdit = () => {
    setEditMode((prev) => {
      if (!prev) {
        reset({ description: description || "" });
      }
      return !prev;
    });
  };

  const onSubmit = (formData: FormType) => mutate(formData);

  return (
    <Card className="border-slate-200 shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
          <CardTitle className="text-lg text-slate-900">Description</CardTitle>
          {!editMode ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleToggleEdit}
              className="text-slate-600 hover:text-slate-900"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          ) : null}
        </CardHeader>

        <CardContent className="pt-2">
          {!editMode ? (
            <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
              {description}
            </p>
          ) : (
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <div className="flex flex-col">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-slate-900 mb-1.5"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    disabled={isPending}
                    className="min-h-[120px]"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                  {errors.description?.message ? (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  ) : null}
                </div>
              )}
            />
          )}
        </CardContent>

        {editMode ? (
          <CardFooter className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleEdit}
              disabled={isPending}
            >
              <X className="h-4 w-4" />
              Close edit
            </Button>
            <Button type="submit" variant="default" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Save
            </Button>
          </CardFooter>
        ) : null}
      </form>
    </Card>
  );
};
