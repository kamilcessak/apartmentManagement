import { useLocation, useNavigate } from "react-router-dom";
import {
  MdHome,
  MdGroups,
  MdApartment,
  MdSettings,
  MdLogout,
  MdRealEstateAgent,
} from "react-icons/md";
import { toast } from "react-toastify";

import { IconProps } from "../types.ts";
import { NavItem } from "./NavItem.tsx";
import { Divider } from "../common/Divider.tsx";
import { UserItem } from "../common/UserItem.tsx";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logOut = () => {
    sessionStorage.removeItem("token");
    toast("Pomyślnie wylogowano uzytkownika", { type: "success" });
    navigate("/", { replace: true });
  };

  const pathMatches = (pathname: string, routes: string[]) => {
    return routes.some((route) => {
      const regex = new RegExp("^" + route.replace(/:[^/]+/g, "[^/]+") + "$");
      return regex.test(pathname);
    });
  };

  const topNavItems = [
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
  ];

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
