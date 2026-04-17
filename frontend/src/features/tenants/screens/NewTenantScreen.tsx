import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";

import { RouteContent } from "@components/common";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { cn } from "@/lib/utils";
import api from "@services/api";

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  personalId: string;
  address: string;
};

type FieldName = keyof FormValues;

type FieldConfig = {
  name: FieldName;
  labelKey: string;
  placeholderKey: string;
  type?: string;
  autoComplete?: string;
  fullWidth?: boolean;
};

export const NewTenantScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const schema = useMemo(
    () =>
      yup.object().shape({
        firstName: yup
          .string()
          .trim()
          .required(t("tenants.newTenant.validation.firstNameRequired")),
        lastName: yup
          .string()
          .trim()
          .required(t("tenants.newTenant.validation.lastNameRequired")),
        email: yup
          .string()
          .trim()
          .email(t("tenants.newTenant.validation.emailInvalid"))
          .required(t("tenants.newTenant.validation.emailRequired")),
        phoneNumber: yup
          .string()
          .trim()
          .required(t("tenants.newTenant.validation.phoneRequired")),
        personalId: yup
          .string()
          .trim()
          .required(t("tenants.newTenant.validation.personalIdRequired")),
        address: yup
          .string()
          .trim()
          .required(t("tenants.newTenant.validation.addressRequired")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      personalId: "",
      address: "",
    },
  });

  const createTenant = async (data: FormValues) => {
    const response = await api.post("/tenant", data);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: createTenant,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
      toast(t("tenants.newTenant.successToast"), { type: "success" });
      navigate(-1);
    },
    onError: (error) => {
      console.error(error);
      toast(t("tenants.newTenant.errorToast"), { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  const fields: FieldConfig[] = [
    {
      name: "firstName",
      labelKey: "tenants.newTenant.fields.firstName.label",
      placeholderKey: "tenants.newTenant.fields.firstName.placeholder",
      autoComplete: "given-name",
    },
    {
      name: "lastName",
      labelKey: "tenants.newTenant.fields.lastName.label",
      placeholderKey: "tenants.newTenant.fields.lastName.placeholder",
      autoComplete: "family-name",
    },
    {
      name: "email",
      labelKey: "tenants.newTenant.fields.email.label",
      placeholderKey: "tenants.newTenant.fields.email.placeholder",
      type: "email",
      autoComplete: "email",
    },
    {
      name: "phoneNumber",
      labelKey: "tenants.newTenant.fields.phoneNumber.label",
      placeholderKey: "tenants.newTenant.fields.phoneNumber.placeholder",
      type: "tel",
      autoComplete: "tel",
    },
    {
      name: "personalId",
      labelKey: "tenants.newTenant.fields.personalId.label",
      placeholderKey: "tenants.newTenant.fields.personalId.placeholder",
      fullWidth: true,
    },
    {
      name: "address",
      labelKey: "tenants.newTenant.fields.address.label",
      placeholderKey: "tenants.newTenant.fields.address.placeholder",
      autoComplete: "street-address",
      fullWidth: true,
    },
  ];

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("tenants.newTenant.back")}
          </Button>

          <Card className="border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">
                  {t("tenants.newTenant.title")}
                </CardTitle>
                <CardDescription className="text-slate-500">
                  {t("tenants.newTenant.description")}
                </CardDescription>
              </CardHeader>

              <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  const error = errors[field.name]?.message;
                  return (
                    <div
                      key={field.name}
                      className={cn(
                        "flex flex-col gap-1.5",
                        field.fullWidth && "md:col-span-2"
                      )}
                    >
                      <Label
                        htmlFor={field.name}
                        className="font-medium text-slate-900"
                      >
                        {t(field.labelKey)}
                      </Label>
                      <Input
                        id={field.name}
                        type={field.type ?? "text"}
                        autoComplete={field.autoComplete}
                        placeholder={t(field.placeholderKey)}
                        aria-invalid={!!error}
                        aria-describedby={
                          error ? `${field.name}-error` : undefined
                        }
                        disabled={isPending}
                        className={cn(
                          "placeholder:text-slate-400",
                          error &&
                            "border-destructive focus-visible:ring-destructive"
                        )}
                        {...register(field.name)}
                      />
                      {error ? (
                        <p
                          id={`${field.name}-error`}
                          className="text-xs text-destructive"
                        >
                          {error}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </CardContent>

              <CardFooter className="flex flex-col-reverse justify-end gap-2 pt-4 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={isPending}
                  className="sm:min-w-[120px]"
                >
                  {t("tenants.newTenant.cancel")}
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isPending}
                  className="sm:min-w-[160px]"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {t("tenants.newTenant.submit")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </RouteContent>
  );
};
