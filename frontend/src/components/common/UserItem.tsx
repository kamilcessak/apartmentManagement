export const UserItem = () => {
  return (
    <div className="flex items-center gap-4">
      <img
        className="w-12 h-12 object-contain rounded-full"
        src={"https://picsum.photos/200"}
        alt="profile photo"
      />
      <div className="flex flex-col text-wrap">
        <p>Kamil Cessak</p>
        <p>kamil.cessak@gmail.com</p>
      </div>
    </div>
  );
};
