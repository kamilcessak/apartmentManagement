import { FC, ReactElement } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Users,
  Building2,
  KeyRound,
  ReceiptText,
  Settings,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@components/ui/avatar";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { useCurrentUser } from "../../hooks";

type NavItemConfig = {
  links: string[];
  labelKey: string;
  icon: LucideIcon;
};

const landlordNavItems: NavItemConfig[] = [
  { links: ["/home"], labelKey: "navigation.home", icon: Home },
  {
    links: ["/tenants", "/tenant/:id", "/tenants/add"],
    labelKey: "navigation.tenants",
    icon: Users,
  },
  {
    links: ["/apartments", "/apartments/new", "/apartment/:id"],
    labelKey: "navigation.apartments",
    icon: Building2,
  },
  {
    links: ["/rentals", "/rentals/new", "/rental/:id"],
    labelKey: "navigation.rentals",
    icon: KeyRound,
  },
  {
    links: ["/invoices", "/invoices/new", "/invoice/:id", "/invoice/:id/edit"],
    labelKey: "navigation.invoices",
    icon: ReceiptText,
  },
];

const tenantNavItems: NavItemConfig[] = [
  { links: ["/home"], labelKey: "navigation.home", icon: Home },
  {
    links: ["/my-apartment"],
    labelKey: "navigation.myApartment",
    icon: Building2,
  },
  {
    links: ["/my-invoices"],
    labelKey: "navigation.myInvoices",
    icon: ReceiptText,
  },
];

type SidebarLinkProps = {
  to: string;
  icon: LucideIcon;
  title: string;
  active: boolean;
};

const SidebarLink: FC<SidebarLinkProps> = ({
  to,
  icon: Icon,
  title,
  active,
}) => (
  <Link
    to={to}
    className={cn(
      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    <Icon
      className={cn(
        "h-[18px] w-[18px]",
        active ? "text-primary-foreground" : "text-slate-500"
      )}
    />
    <span>{title}</span>
  </Link>
);

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part.charAt(0))
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export const Navigation = (): ReactElement => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user, role, isTenant, isLandlord } = useCurrentUser();

  const logOut = () => {
    sessionStorage.removeItem("token");
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    toast(t("navigation.signOutToast"), { type: "success" });
    navigate("/", { replace: true });
  };

  const pathMatches = (pathname: string, routes: string[]) =>
    routes.some((route) => {
      const regex = new RegExp("^" + route.replace(/:[^/]+/g, "[^/]+") + "$");
      return regex.test(pathname);
    });

  const topNavItems: NavItemConfig[] = isTenant
    ? tenantNavItems
    : isLandlord
    ? landlordNavItems
    : [];

  const displayName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : user?.tenant
      ? `${user.tenant.firstName} ${user.tenant.lastName}`.trim()
      : user?.email?.split("@")[0] ?? t("navigation.defaultUser");

  const initials = getInitials(displayName);
  const roleLabel = isLandlord
    ? t("navigation.roleLandlord")
    : isTenant
    ? t("navigation.roleTenant")
    : role ?? "";

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-card">
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Building2 className="h-5 w-5" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-slate-900">
            {t("navigation.brandTitle")}
          </span>
          <span className="text-xs text-slate-500">
            {t("navigation.brandSubtitle")}
          </span>
        </div>
      </div>

      <Separator />

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t("navigation.sectionMenu")}
        </p>
        {topNavItems.map((item) => (
          <SidebarLink
            key={`nav-${item.labelKey}`}
            to={item.links[0]}
            icon={item.icon}
            title={t(item.labelKey)}
            active={pathMatches(location.pathname, item.links)}
          />
        ))}

        <p className="mt-4 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {t("navigation.sectionAccount")}
        </p>
        <SidebarLink
          to="/settings"
          icon={Settings}
          title={t("navigation.settings")}
          active={location.pathname === "/settings"}
        />
      </nav>

      <Separator />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://picsum.photos/200" alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {initials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-slate-900">
              {displayName}
            </span>
            <span className="truncate text-xs text-slate-500">
              {user?.email}
            </span>
            {roleLabel ? (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {roleLabel}
              </span>
            ) : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logOut}
          className="w-full justify-start text-slate-600 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          {t("navigation.signOut")}
        </Button>
      </div>
    </aside>
  );
};
