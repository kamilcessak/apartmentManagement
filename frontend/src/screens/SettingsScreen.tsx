import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

import { RouteContent } from "@components/common";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Separator } from "@components/ui/separator";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "../hooks";

type SettingsTab = "profile" | "company" | "notifications";

const tabs: { id: SettingsTab; label: string }[] = [
  { id: "profile", label: "Profil" },
  { id: "company", label: "Dane firmy" },
  { id: "notifications", label: "Powiadomienia" },
];

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
  const { user } = useCurrentUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const syncFromUser = useCallback(() => {
    if (!user) return;
    const fn =
      user.firstName ??
      user.tenant?.firstName ??
      "";
    const ln =
      user.lastName ??
      user.tenant?.lastName ??
      "";
    setFirstName(fn);
    setLastName(ln);
    setEmail(user.email ?? user.tenant?.email ?? "");
  }, [user]);

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
    toast.success("Zdjęcie wybrane — zapisz zmiany, aby je zatwierdzić.");
    e.target.value = "";
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.info(
      "Zapis profilu będzie dostępny po podłączeniu endpointu API — pola są gotowe do integracji."
    );
  };

  return (
    <RouteContent sectionStyle={{ flexDirection: "column" }}>
      <header className="border-b border-slate-200 bg-background px-8 py-6">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Ustawienia
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Zarządzaj swoim kontem, danymi do faktur i preferencjami
        </p>
      </header>

      <main className="flex flex-1 flex-col overflow-y-auto bg-slate-50/80 px-8 py-8">
        <div className="mx-auto w-full max-w-4xl">
          <div
            role="tablist"
            aria-label="Sekcje ustawień"
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
                      Zmień zdjęcie
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-firstName" className="text-slate-900">
                      Imię
                    </Label>
                    <Input
                      id="settings-firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      placeholder="Imię"
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="settings-lastName" className="text-slate-900">
                      Nazwisko
                    </Label>
                    <Input
                      id="settings-lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      autoComplete="family-name"
                      placeholder="Nazwisko"
                      className="placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label htmlFor="settings-email" className="text-slate-900">
                      E-mail
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
                        Aktualne hasło
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
                        Nowe hasło
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
                    Zapisz zmiany
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "company" && (
              <p className="text-sm text-muted-foreground">
                Tutaj pojawią się dane firmy do faktur (NIP, adres, dane
                płatności).
              </p>
            )}

            {activeTab === "notifications" && (
              <p className="text-sm text-muted-foreground">
                Tutaj skonfigurujesz powiadomienia e-mail i przypomnienia.
              </p>
            )}
          </div>
        </div>
      </main>
    </RouteContent>
  );
};
