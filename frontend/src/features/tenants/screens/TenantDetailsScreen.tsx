import { FC, ReactNode, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { ArrowLeft, Loader2, Mail, Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { Avatar, AvatarFallback } from "@components/ui/avatar";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import api from "@services/api";

import { TenantDetailsFormType, TenantType } from "../types/tenant.type";

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase() || "?";
};

type InfoFieldProps = {
  label: string;
  value?: string | null;
  emptyPlaceholder: string;
};

const InfoField: FC<InfoFieldProps> = ({ label, value, emptyPlaceholder }) => (
  <div className="flex flex-col gap-1">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-base font-medium text-slate-900 break-words">
      {value?.trim() ? value : emptyPlaceholder}
    </span>
  </div>
);

type EditableFieldProps = {
  id: string;
  label: string;
  error?: string;
  disabled?: boolean;
  children: ReactNode;
};

const EditableField: FC<EditableFieldProps> = ({
  id,
  label,
  error,
  children,
}) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={id} className="text-sm text-slate-500 font-normal">
      {label}
    </Label>
    {children}
    {error ? <p className="text-xs text-destructive">{error}</p> : null}
  </div>
);

export const TenantDetailsScreen = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [editMode, setEditMode] = useState(false);

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
      }),
    [t]
  );

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TenantDetailsFormType>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
    },
  });

  const fetchTenant = async () => {
    const response = await api.get<TenantType>(`/tenant/${id}`);
    return response.data;
  };

  const { data, isLoading, isError, error, refetch, isSuccess } = useQuery({
    queryKey: ["tenant", `${id}`],
    queryFn: fetchTenant,
    enabled: !!id,
  });

  useEffect(() => {
    if (isSuccess && data) {
      reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
      });
    }
  }, [isSuccess, data, reset]);

  const { mutate: saveTenant, isPending: isSaving } = useMutation({
    mutationFn: async (formData: TenantDetailsFormType) =>
      api.patch(`/tenant/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", `${id}`] });
      queryClient.invalidateQueries({ queryKey: ["tenants", "list"] });
      setEditMode(false);
      toast(t("tenants.details.saveSuccess"), { type: "success" });
    },
    onError: () => {
      toast(t("tenants.details.saveError"), { type: "error" });
    },
  });

  const { mutate: resendInvitation, isPending: isResending } = useMutation({
    mutationFn: async () => api.post(`/tenant/${id}/invite`),
    onSuccess: () => {
      toast(t("tenants.details.resendSuccess"), { type: "success" });
    },
    onError: (err: unknown) => {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? t("tenants.details.resendError");
      toast(message, { type: "error" });
    },
  });

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message ?? ""}`} onClick={refetch} />;

  const fullName = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
  const isPending = !data.userID;
  const emptyPlaceholder = t("tenants.details.empty");

  const handleToggleEdit = () => {
    if (editMode) {
      reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        phoneNumber: data.phoneNumber ?? "",
      });
    }
    setEditMode((prev) => !prev);
  };

  const onSubmit = (formData: TenantDetailsFormType) => saveTenant(formData);

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <div className="flex h-full w-full justify-center overflow-y-auto bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("tenants.details.back")}
          </Button>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                  <AvatarFallback className="bg-slate-100 text-xl font-semibold text-slate-700">
                    {getInitials(data.firstName, data.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-slate-900">
                      {fullName || emptyPlaceholder}
                    </h1>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-xs font-medium",
                        isPending
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-50"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                      )}
                    >
                      {isPending
                        ? t("tenants.details.pendingInvitation")
                        : t("tenants.details.accountLinked")}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-500">
                    {data.email || emptyPlaceholder}
                  </p>
                </div>
              </div>

              {isPending ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => resendInvitation()}
                  disabled={isResending}
                  className="self-start sm:self-auto"
                >
                  {isResending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                  {t("tenants.details.resendInvitation")}
                </Button>
              ) : null}
            </CardContent>
          </Card>

          <Card className="mt-4 border-slate-200 shadow-sm">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-4">
                <CardTitle className="text-lg text-slate-900">
                  {t("tenants.details.mainInfo")}
                </CardTitle>

                {editMode ? (
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleToggleEdit}
                      disabled={isSaving}
                      className="text-slate-600 hover:text-slate-900"
                    >
                      <X className="h-4 w-4" />
                      {t("tenants.details.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      variant="default"
                      size="sm"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {t("tenants.details.save")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleEdit}
                    className="text-slate-600 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                    {t("tenants.details.edit")}
                  </Button>
                )}
              </CardHeader>

              <CardContent className="pt-2">
                {editMode ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Controller
                      control={control}
                      name="firstName"
                      render={({ field }) => (
                        <EditableField
                          id="firstName"
                          label={t("tenants.details.fields.firstName")}
                          error={errors.firstName?.message}
                        >
                          <Input
                            id="firstName"
                            disabled={isSaving}
                            {...field}
                          />
                        </EditableField>
                      )}
                    />
                    <Controller
                      control={control}
                      name="lastName"
                      render={({ field }) => (
                        <EditableField
                          id="lastName"
                          label={t("tenants.details.fields.lastName")}
                          error={errors.lastName?.message}
                        >
                          <Input
                            id="lastName"
                            disabled={isSaving}
                            {...field}
                          />
                        </EditableField>
                      )}
                    />
                    <Controller
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <EditableField
                          id="email"
                          label={t("tenants.details.fields.email")}
                          error={errors.email?.message}
                        >
                          <Input
                            id="email"
                            type="email"
                            disabled={isSaving}
                            {...field}
                          />
                        </EditableField>
                      )}
                    />
                    <Controller
                      control={control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <EditableField
                          id="phoneNumber"
                          label={t("tenants.details.fields.phoneNumber")}
                          error={errors.phoneNumber?.message}
                        >
                          <Input
                            id="phoneNumber"
                            type="tel"
                            disabled={isSaving}
                            {...field}
                          />
                        </EditableField>
                      )}
                    />
                    <InfoField
                      label={t("tenants.details.fields.invitationCode")}
                      value={data.invitationCode}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <InfoField
                      label={t("tenants.details.fields.firstName")}
                      value={data.firstName}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                    <InfoField
                      label={t("tenants.details.fields.lastName")}
                      value={data.lastName}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                    <InfoField
                      label={t("tenants.details.fields.email")}
                      value={data.email}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                    <InfoField
                      label={t("tenants.details.fields.phoneNumber")}
                      value={data.phoneNumber}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                    <InfoField
                      label={t("tenants.details.fields.invitationCode")}
                      value={data.invitationCode}
                      emptyPlaceholder={emptyPlaceholder}
                    />
                  </div>
                )}
              </CardContent>
            </form>
          </Card>
        </div>
      </div>
    </RouteContent>
  );
};
