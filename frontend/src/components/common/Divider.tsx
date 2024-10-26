import React from "react";

export const Divider = ({
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="bg-gray-400 w-full rounded"
    style={{ height: "1px", ...style }}
    {...props}
  />
);
