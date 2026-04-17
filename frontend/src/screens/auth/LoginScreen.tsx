import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
};

export const LoginScreen = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object().shape({
        email: yup.string().required(t("auth.login.validation.emailRequired")),
        password: yup
          .string()
          .required(t("auth.login.validation.passwordRequired")),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleLogin = async (data: FormValues) => {
    const response = await api.post("/login", data);
    return response;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handleLogin,
    onSuccess: async (data) => {
      if (data?.data.token) {
        sessionStorage.setItem("token", data.data.token);
        await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
        toast(t("auth.login.successToast"), { type: "success" });
        navigate("/home", { replace: true, state: { loggedIn: true } });
      } else {
        toast(t("auth.login.errorFallback"), { type: "error" });
      }
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? t("auth.login.errorFallback");
      toast(message, { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => mutate(data);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
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
              {t("auth.login.title")}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {t("auth.login.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.login.emailLabel")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isPending}
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
                  htmlFor="password"
                  className="text-sm font-medium text-slate-900"
                >
                  {t("auth.login.passwordLabel")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
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
                {t("auth.login.submit")}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              {t("auth.login.footerPrompt")}{" "}
              <Link
                to="/register"
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {t("auth.login.footerAction")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
