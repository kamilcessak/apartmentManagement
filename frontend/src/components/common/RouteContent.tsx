import React, { FC, PropsWithChildren } from "react";

type Props = {
  sectionStyle?: React.CSSProperties;
};

export const RouteContent: FC<PropsWithChildren<Props>> = ({
  children,
  sectionStyle,
}) => (
  <div className="flex flex-1 w-full p-8">
    <section
      className="flex w-full bg-blue-100 rounded-2xl p-4"
      style={sectionStyle}
    >
      {children}
    </section>
  </div>
);
