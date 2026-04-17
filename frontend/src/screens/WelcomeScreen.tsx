import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const WelcomeScreen = () => {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Building2 className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-slate-500">
            {t("common.appName")}
          </p>
        </div>

        <Card className="w-full border-slate-200 shadow-sm">
          <CardHeader className="space-y-2 p-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
              {t("welcome.title")}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              {t("welcome.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-8 pt-4">
            <Button asChild variant="default" className="w-full" size="lg">
              <Link to="/login">
                {t("welcome.login")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link to="/register">{t("welcome.register")}</Link>
            </Button>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} {t("common.appName")}
        </p>
      </div>
    </div>
  );
};
