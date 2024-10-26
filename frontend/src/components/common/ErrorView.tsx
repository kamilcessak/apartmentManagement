import { FC } from "react";

type Props = { message: string; onClick: () => void };

export const ErrorView: FC<Props> = ({ message, onClick }) => (
  <div className="flex flex-1 w-full p-8">
    <section className="flex w-full flex-col gap-8 items-center justify-center bg-red-100 border-2 border-red-600 rounded-2xl p-4">
      <h1 className="text-3xl text-red-700">An error occurred</h1>
      <p className="text-md italic">{message}</p>
      {onClick && (
        <button
          onClick={onClick}
          className="border border-black p-2 px-10 rounded-md hover:bg-black hover:text-white transition-colors duration-300 ease-in-out"
        >
          Try again
        </button>
      )}
    </section>
  </div>
);
