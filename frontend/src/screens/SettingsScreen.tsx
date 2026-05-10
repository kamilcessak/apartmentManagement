import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import api from "@services/api";
import { RouteContent } from "@components/common";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select";
import { cn } from "@/lib/utils";
import { useAppLanguage, useCurrentUser } from "../hooks";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@utils/i18n";

type SettingsTab = "profile" | "myInfo" | "notifications" | "language";

const getInitials = (first: string, last: string, email: string) => {
  const fromNames = `${first} ${last}`.trim();
  if (fromNames.length > 0) {
    return fromNames
      .split(/\s+/)
      .map((p) => p.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  return email.charAt(0).toUpperCase() || "U";
};

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const { user, isLandlord } = useCurrentUser();
  const { language, changeLanguage } = useAppLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [infoFirstName, setInfoFirstName] = useState("");
  const [infoLastName, setInfoLastName] = useState("");
  const [infoEmail, setInfoEmail] = useState("");
  const [infoPhone, setInfoPhone] = useState("");
  const [infoStreet, setInfoStreet] = useState("");
  const [infoBuildingNumber, setInfoBuildingNumber] = useState("");
  const [infoApartmentNumber, setInfoApartmentNumber] = useState("");
  const [infoPostalCode, setInfoPostalCode] = useState("");
  const [infoCity, setInfoCity] = useState("");
  const [infoBankIban, setInfoBankIban] = useState("");
  const [infoBankName, setInfoBankName] = useState("");

  const queryClient = useQueryClient();

  const tabs: { id: SettingsTab; label: string }[] = [
    { id: "profile", label: t("settings.tabs.profile") },
    { id: "myInfo", label: t("settings.tabs.myInfo") },
    { id: "notifications", label: t("settings.tabs.notifications") },
    { id: "language", label: t("settings.tabs.language") },
  ];

  const syncFromUser = useCallback(() => {
    if (!user) return;
    const fn = user.firstName ?? user.tenant?.firstName ?? "";
    const ln = user.lastName ?? user.tenant?.lastName ?? "";
    setFirstName(fn);
    setLastName(ln);
    setEmail(user.email ?? user.tenant?.email ?? "");

    setInfoFirstName(fn);
    setInfoLastName(ln);
    setInfoEmail(user.email ?? "");
    setInfoPhone(user.phoneNumber ?? "");
    setInfoStreet(user.street ?? "");
    setInfoBuildingNumber(user.buildingNumber ?? "");
    setInfoApartmentNumber(user.apartmentNumber ?? "");
    setInfoPostalCode(user.postalCode ?? "");
    setInfoCity(user.city ?? "");
    setInfoBankIban(user.bankAccountIban ?? "");
    setInfoBankName(user.bankName ?? "");
  }, [user]);

  const saveMyInfoMutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      api.patch("/me", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success(t("settings.myInfo.saveSuccess"));
    },
    onError: () => {
      toast.error(t("settings.myInfo.saveError"));
    },
  });

  const handleSaveMyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    saveMyInfoMutation.mutate({
      firstName: infoFirstName,
      lastName: infoLastName,
      phoneNumber: infoPhone,
      street: infoStreet,
      buildingNumber: infoBuildingNumber,
      apartmentNumber: infoApartmentNumber,
      postalCode: infoPostalCode,
      city: infoCity,
      bankAccountIban: infoBankIban,
      bankName: infoBankName,
    });
  };

  useEffect(() => {
    syncFromUser();
  }, [syncFromUser]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const initials = getInitials(firstName, lastName, email);

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const onAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });
    toast.success(t("settings.profile.photoSelected"));
    e.target.value = "";
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(t("settings.profile.saveNotReady"));
  };

  const handleLanguageChange = async (value: string) => {
    await changeLanguage(value as SupportedLanguage);
    toast.success(t("settings.language.successToast"));
  };

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <header className="border-b border-slate-200 bg-background px-8 py-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          {t("settings.title")}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          {t("settings.subtitle")}
        </p>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-50/80 px-8 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div
            role="tablist"
            aria-label={t("settings.title")}
            className="flex flex-wrap gap-0 border-b border-gray-200"
          >
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  id={`settings-tab-${tab.id}`}
                  aria-controls={`settings-panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative -mb-px border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div
            className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            role="tabpanel"
            id={`settings-panel-${activeTab}`}
            aria-labelledby={`settings-tab-${activeTab}`}
          >
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Avatar className="h-20 w-20 border border-gray-100">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="" />
                    ) : null}
                    <AvatarFallback className="bg-slate-100 text-lg font-semibold text-slate-600">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={onAvatarFileChange}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAvatarPick}
                      className="w-fit text-slate-700 hover:text-slate-900"
                    >
                      {t("settings.profile.changePhoto")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-firstName" className="text-slate-900">
                      {t("settings.profile.firstName")}
                    </Label>
                    <Input
                      id="settings-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      placeholder={t("settings.profile.firstName")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-lastName" className="text-slate-900">
                      {t("settings.profile.lastName")}
                    </Label>
                    <Input
                      id="settings-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      placeholder={t("settings.profile.lastName")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label htmlFor="settings-email" className="text-slate-900">
                      {t("settings.profile.email")}
                    </Label>
                    <Input
                      id="settings-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="email@example.com"
                      className="placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Separator className="bg-gray-200" />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="settings-current-password"
                        className="text-slate-900"
                      >
                        {t("settings.profile.currentPassword")}
                      </Label>
                      <Input
                        id="settings-current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="placeholder:text-slate-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="settings-new-password"
                        className="text-slate-900"
                      >
                        {t("settings.profile.newPassword")}
                      </Label>
                      <Input
                        id="settings-new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        className="placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    className="min-w-[160px] bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {t("settings.profile.saveChanges")}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "myInfo" && (
              <form onSubmit={handleSaveMyInfo} className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("settings.myInfo.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(
                      isLandlord
                        ? "settings.myInfo.descriptionLandlord"
                        : "settings.myInfo.descriptionTenant"
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="info-firstName" className="text-slate-900">
                      {t("settings.myInfo.firstName")}
                    </Label>
                    <Input
                      id="info-firstName"
                      value={infoFirstName}
                      onChange={(e) => setInfoFirstName(e.target.value)}
                      autoComplete="given-name"
                      placeholder={t("settings.myInfo.firstNamePlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="info-lastName" className="text-slate-900">
                      {t("settings.myInfo.lastName")}
                    </Label>
                    <Input
                      id="info-lastName"
                      value={infoLastName}
                      onChange={(e) => setInfoLastName(e.target.value)}
                      autoComplete="family-name"
                      placeholder={t("settings.myInfo.lastNamePlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="info-email" className="text-slate-900">
                      {t("settings.myInfo.email")}
                    </Label>
                    <Input
                      id="info-email"
                      type="email"
                      value={infoEmail}
                      disabled
                      autoComplete="email"
                      className="bg-slate-50 text-slate-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="info-phone" className="text-slate-900">
                      {t("settings.myInfo.phoneNumber")}
                    </Label>
                    <Input
                      id="info-phone"
                      type="tel"
                      value={infoPhone}
                      onChange={(e) => setInfoPhone(e.target.value)}
                      autoComplete="tel"
                      placeholder={t("settings.myInfo.phoneNumberPlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                  <div className="flex flex-col gap-1.5 md:col-span-7">
                    <Label htmlFor="info-street" className="text-slate-900">
                      {t("settings.myInfo.street")}
                    </Label>
                    <Input
                      id="info-street"
                      value={infoStreet}
                      onChange={(e) => setInfoStreet(e.target.value)}
                      autoComplete="address-line1"
                      placeholder={t("settings.myInfo.streetPlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label
                      htmlFor="info-buildingNumber"
                      className="text-slate-900"
                    >
                      {t("settings.myInfo.buildingNumber")}
                    </Label>
                    <Input
                      id="info-buildingNumber"
                      value={infoBuildingNumber}
                      onChange={(e) => setInfoBuildingNumber(e.target.value)}
                      placeholder={t(
                        "settings.myInfo.buildingNumberPlaceholder"
                      )}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-3">
                    <Label
                      htmlFor="info-apartmentNumber"
                      className="text-slate-900"
                    >
                      {t("settings.myInfo.apartmentNumber")}
                      <span className="ml-1 font-normal text-slate-500">
                        {t("settings.myInfo.apartmentNumberOptional")}
                      </span>
                    </Label>
                    <Input
                      id="info-apartmentNumber"
                      value={infoApartmentNumber}
                      onChange={(e) => setInfoApartmentNumber(e.target.value)}
                      placeholder={t(
                        "settings.myInfo.apartmentNumberPlaceholder"
                      )}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-4">
                    <Label
                      htmlFor="info-postalCode"
                      className="text-slate-900"
                    >
                      {t("settings.myInfo.postalCode")}
                    </Label>
                    <Input
                      id="info-postalCode"
                      value={infoPostalCode}
                      onChange={(e) => setInfoPostalCode(e.target.value)}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      placeholder={t("settings.myInfo.postalCodePlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-8">
                    <Label htmlFor="info-city" className="text-slate-900">
                      {t("settings.myInfo.city")}
                    </Label>
                    <Input
                      id="info-city"
                      value={infoCity}
                      onChange={(e) => setInfoCity(e.target.value)}
                      autoComplete="address-level2"
                      placeholder={t("settings.myInfo.cityPlaceholder")}
                      className="placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {isLandlord && (
                  <div className="space-y-4">
                    <Separator className="bg-gray-200" />
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="info-iban" className="text-slate-900">
                          {t("settings.myInfo.bankAccountIban")}
                        </Label>
                        <Input
                          id="info-iban"
                          value={infoBankIban}
                          onChange={(e) => setInfoBankIban(e.target.value)}
                          placeholder={t(
                            "settings.myInfo.bankAccountIbanPlaceholder"
                          )}
                          className="placeholder:text-slate-400"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label
                          htmlFor="info-bankName"
                          className="text-slate-900"
                        >
                          {t("settings.myInfo.bankName")}
                        </Label>
                        <Input
                          id="info-bankName"
                          value={infoBankName}
                          onChange={(e) => setInfoBankName(e.target.value)}
                          placeholder={t(
                            "settings.myInfo.bankNamePlaceholder"
                          )}
                          className="placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={saveMyInfoMutation.isPending}
                    className="min-w-[160px] bg-purple-600 text-white hover:bg-purple-700"
                  >
                    {t("settings.myInfo.saveChanges")}
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "notifications" && (
              <p className="text-sm text-muted-foreground">
                {t("settings.notifications.placeholder")}
              </p>
            )}

            {activeTab === "language" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {t("settings.language.title")}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("settings.language.description")}
                  </p>
                </div>

                <div className="flex flex-col gap-1.5 max-w-xs">
                  <Label htmlFor="settings-language" className="text-slate-900">
                    {t("settings.language.label")}
                  </Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger id="settings-language" className="w-full">
                      <SelectValue
                        placeholder={t("settings.language.selectPlaceholder")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lng) => (
                        <SelectItem key={lng} value={lng}>
                          {t(`settings.language.options.${lng}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </RouteContent>
  );
};
