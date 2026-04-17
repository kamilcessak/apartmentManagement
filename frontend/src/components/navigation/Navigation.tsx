import { ReactElement } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdGroups,
  MdApartment,
  MdSettings,
  MdLogout,
  MdRealEstateAgent,
  MdReceiptLong,
  MdDescription,
} from "react-icons/md";
import { toast } from "react-toastify";

import { IconProps } from "../types.ts";
import { NavItem } from "./NavItem.tsx";
import { Divider } from "../common/Divider.tsx";
import { UserItem } from "../common/UserItem.tsx";
import { useCurrentUser } from "../../hooks";

type NavItemConfig = {
  links: string[];
  title: string;
  icon: (props: IconProps) => ReactElement;
};

const landlordNavItems: NavItemConfig[] = [
  {
    links: ["/home"],
    title: "Home",
    icon: (props: IconProps) => <MdHome {...props} />,
  },
  {
    links: ["/tenants", "/tenant/:id", "/tenants/add"],
    title: "Tenants",
    icon: (props: IconProps) => <MdGroups {...props} />,
  },
  {
    links: ["/apartments", "/apartments/new", "/apartment/:id"],
    title: "Apartments",
    icon: (props: IconProps) => <MdApartment {...props} />,
  },
  {
    links: ["/rentals", "/rentals/new", "/rental/:id"],
    title: "Rentals",
    icon: (props: IconProps) => <MdRealEstateAgent {...props} />,
  },
  {
    links: ["/invoices", "/invoices/new", "/invoice/:id", "/invoice/:id/edit"],
    title: "Invoices",
    icon: (props: IconProps) => <MdReceiptLong {...props} />,
  },
];

const tenantNavItems: NavItemConfig[] = [
  {
    links: ["/home"],
    title: "Home",
    icon: (props: IconProps) => <MdHome {...props} />,
  },
  {
    links: ["/my-apartment"],
    title: "My apartment",
    icon: (props: IconProps) => <MdApartment {...props} />,
  },
  {
    links: ["/my-invoices"],
    title: "My invoices",
    icon: (props: IconProps) => <MdReceiptLong {...props} />,
  },
  {
    links: ["/my-documents"],
    title: "My documents",
    icon: (props: IconProps) => <MdDescription {...props} />,
  },
];

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isTenant, isLandlord } = useCurrentUser();

  const logOut = () => {
    sessionStorage.removeItem("token");
    queryClient.removeQueries({ queryKey: ["currentUser"] });
    toast("Pomyślnie wylogowano uzytkownika", { type: "success" });
    navigate("/", { replace: true });
  };

  const pathMatches = (pathname: string, routes: string[]) => {
    return routes.some((route) => {
      const regex = new RegExp("^" + route.replace(/:[^/]+/g, "[^/]+") + "$");
      return regex.test(pathname);
    });
  };

  // Until we know the role, prefer showing nothing role-specific (avoids a
  // flash of Landlord nav on Tenant sessions). Bottom nav and user card
  // render regardless so sign-out is always reachable.
  const topNavItems: NavItemConfig[] = isTenant
    ? tenantNavItems
    : isLandlord
    ? landlordNavItems
    : [];

  const bottomNavItems = [
    {
      links: ["/settings"],
      title: "Settings",
      icon: () => <MdSettings size={30} />,
    },
    {
      title: "Sign Out",
      icon: () => <MdLogout size={30} />,
      onClick: logOut,
    },
  ];

  return (
    <nav className="flex flex-col h-screen p-4 bg-blue-100 items-center justify-between">
      <div className="flex flex-col w-full items-center justify-center gap-8">
        <h3 className="font-extrabold text-wrap w-4/5 text-center">
          Apartment Management
        </h3>
        <ul className="flex flex-1 gap-2 flex-col border-red-600 w-full">
          {topNavItems.map((e, i) => {
            return (
              <NavItem
                {...e}
                active={pathMatches(location.pathname, e.links)}
                key={`nav-item-${e.title}-${i}`}
              />
            );
          })}
        </ul>
      </div>
      <div className="flex flex-col gap-0.5">
        <UserItem />
        <Divider style={{ margin: "0px 0px 8px 0px" }} />
        {bottomNavItems.map((e, i) => (
          <NavItem
            {...e}
            active={!!e?.links?.includes(location.pathname)}
            key={`nav-item-${e.title}-${i}`}
          />
        ))}
      </div>
    </nav>
  );
};
