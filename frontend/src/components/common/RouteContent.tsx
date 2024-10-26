import { FC, PropsWithChildren } from "react";

export const RouteContent: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-1 w-full p-8">
      <section className="flex w-full bg-blue-100 rounded-2xl p-4">
        {children}
      </section>
    </div>
  );
};
