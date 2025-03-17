import React, { FC, PropsWithChildren } from "react";

type Props = {
  sectionStyle?: React.CSSProperties;
};

export const RouteContent: FC<PropsWithChildren<Props>> = ({
  children,
  sectionStyle,
}) => (
  <section className="flex flex-1 w-full p-8 flex-col" style={sectionStyle}>
    {children}
  </section>
);
