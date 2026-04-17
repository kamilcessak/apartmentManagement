import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
    <div className="flex flex-1 w-full min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            {t("welcome.title")}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            {t("welcome.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">{t("welcome.login")}</Link>
          </Button>
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link to="/register">{t("welcome.register")}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
