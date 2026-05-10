import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Info, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import api from "@services/api";

type FormValues = {
  email: string;
  password: string;
  phoneNumber: string;
  invitationCode?: string;
};

export const RegisterScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();

  const prefilledEmail = searchParams.get("email") ?? "";
  const prefilledCode = searchParams.get("invitationCode") ?? "";
  const isTenantInvitation = useMemo(
    () => Boolean(prefilledCode),
    [prefilledCode]
  );

  const schema = useMemo(
    () =>
      yup.object().shape({
        email: yup
          .string()
          .email(t("auth.register.validation.emailInvalid"))
          .required(t("auth.register.validation.emailRequired")),
        password: yup
          .string()
          .min(8, t("auth.register.validation.passwordMin"))
          .required(t("auth.register.validation.passwordRequired")),
        phoneNumber: yup
          .string()
          .matches(
            /^[0-9+\-\s()]{6,20}$/,
            t("auth.register.validation.phoneInvalid")
          )
          .required(t("auth.register.validation.phoneRequired")),
        invitationCode: yup.string().optional(),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      email: prefilledEmail,
      password: "",
      phoneNumber: "",
      invitationCode: prefilledCode,
    },
  });

  useEffect(() => {
    reset({
      email: prefilledEmail,
      password: "",
      phoneNumber: "",
      invitationCode: prefilledCode,
    });
  }, [prefilledEmail, prefilledCode, reset]);

  const handleRegister = async (data: FormValues) => {
    const payload: FormValues = {
      email: data.email.trim(),
      password: data.password,
      phoneNumber: data.phoneNumber.trim(),
    };
    const invitationCode = data.invitationCode?.trim();
    if (invitationCode) {
      payload.invitationCode = invitationCode.toUpperCase();
    }
    const response = await api.post("/register", payload);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleRegister,
    onSuccess: (data) => {
      if (data?.status === 201) {
        navigate("/registerSuccess", { replace: true });
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? t("auth.register.errorFallback");
      toast(message, { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md py-6">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mb-4 text-slate-600 hover:text-slate-900"
        >
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("common.back")}
          </Link>
        </Button>

        <Card className="w-full border-slate-200 shadow-sm">
          <CardHeader className="space-y-2 p-8 pb-4">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {isTenantInvitation
                ? t("auth.register.tenantInvitationTitle")
                : t("auth.register.title")}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {t("auth.register.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            {isTenantInvitation ? (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{t("auth.register.tenantInvitationInfo")}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.register.emailLabel")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isPending || isTenantInvitation}
                  aria-invalid={!!errors.email}
                  className={cn(
                    errors.email &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("email")}
                />
                {errors.email?.message ? (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.register.phoneLabel")}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+48 600 000 000"
                  disabled={isPending}
                  aria-invalid={!!errors.phoneNumber}
                  className={cn(
                    errors.phoneNumber &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("phoneNumber")}
                />
                {errors.phoneNumber?.message ? (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.register.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isPending}
                  aria-invalid={!!errors.password}
                  className={cn(
                    errors.password &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("password")}
                />
                {errors.password?.message ? (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="invitationCode"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.register.invitationCodeLabel")}
                </Label>
                <Input
                  id="invitationCode"
                  type="text"
                  placeholder="ABC123"
                  disabled={isPending || isTenantInvitation}
                  aria-invalid={!!errors.invitationCode}
                  className={cn(
                    errors.invitationCode &&
                      "border-destructive focus-visible:ring-destructive"
                  )}
                  {...register("invitationCode")}
                />
                {errors.invitationCode?.message ? (
                  <p className="text-sm text-destructive">
                    {errors.invitationCode.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                variant="default"
                disabled={isPending}
                className="w-full"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {t("auth.register.submit")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {t("auth.register.footerPrompt")}{" "}
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {t("auth.register.footerAction")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
