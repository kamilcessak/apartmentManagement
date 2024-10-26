import React, { FC } from "react";
import { Link } from "react-router-dom";
import { IconProps } from "../types.ts";

type Props = {
  link?: string;
  active: boolean;
  title: string;
  onClick?: () => void;
  icon: FC<IconProps>;
};

export const NavItem: FC<Props> = ({ link, active, title, icon, onClick }) => {
  const Wrapper = (link ? Link : "div") as React.ElementType;

  return (
    <Wrapper
      {...(link ? { to: link } : { onClick })}
      className={`${active ? "text-white" : "text-black"} border font-semibold ${onClick ? "cursor-pointer" : ""} hover:border-black hover:rounded-full transition-all duration-300 ease-in-out`}
    >
      <li
        className={`flex flex-row items-center gap-2 p-4 border-black rounded-full ${active ? "border bg-gray-800" : ""}`}
      >
        {icon({ size: 30, color: active ? "white" : "black" })}
        {title}
      </li>
    </Wrapper>
  );
};
