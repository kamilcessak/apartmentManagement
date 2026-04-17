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
  CardFooter,
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
          .min(6, t("auth.register.validation.passwordMin"))
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
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Link>
        </Button>
        <Card className="w-full shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {isTenantInvitation
                ? t("auth.register.tenantInvitationTitle")
                : t("auth.register.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isTenantInvitation ? (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <p>{t("auth.register.tenantInvitationInfo")}</p>
              </div>
            ) : null}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">{t("auth.register.emailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="phoneNumber">
                  {t("auth.register.phoneLabel")}
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  autoComplete="tel"
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="password">
                  {t("auth.register.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
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

              <div className="flex flex-col gap-2">
                <Label htmlFor="invitationCode">
                  {t("auth.register.invitationCodeLabel")}
                </Label>
                <Input
                  id="invitationCode"
                  type="text"
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
                disabled={isPending}
                className="w-full mt-4"
                size="lg"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                {t("auth.register.submit")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.register.footerPrompt")}{" "}
              <Link
                to="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {t("auth.register.footerAction")}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
