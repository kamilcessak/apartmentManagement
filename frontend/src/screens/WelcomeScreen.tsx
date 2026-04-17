import React from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const WelcomeScreen = () => {
  return (
    <div className="flex flex-1 w-full min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to ApartmentManagement!
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage your rental portfolio easily and transparently.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button asChild className="w-full" size="lg">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild className="w-full" size="lg" variant="outline">
            <Link to="/register">Register</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
