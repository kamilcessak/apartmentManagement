export const EmptyView = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-1 items-center justify-center">
      <h2 className="text-3xl">{message}</h2>
    </div>
  );
};
