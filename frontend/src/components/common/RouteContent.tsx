import React, { FC, PropsWithChildren } from "react";

type Props = {
  sectionStyle?: React.CSSProperties;
};

export const RouteContent: FC<PropsWithChildren<Props>> = ({
  children,
  sectionStyle,
}) => (
  <section className="flex h-screen w-full flex-col" style={sectionStyle}>
    {children}
  </section>
);
