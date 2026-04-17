import { useCurrentUser } from "../../hooks";

export const UserItem = () => {
  const { user, role } = useCurrentUser();

  const displayName =
    user?.firstName || user?.lastName
      ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
      : user?.tenant
      ? `${user.tenant.firstName} ${user.tenant.lastName}`
      : user?.email ?? "Signed in";

  return (
    <div className="flex items-center gap-4">
      <img
        className="w-12 h-12 object-contain rounded-full"
        src={"https://picsum.photos/200"}
        alt="profile photo"
      />
      <div className="flex flex-col text-wrap">
        <p className="font-semibold">{displayName}</p>
        <p className="text-sm text-gray-700">{user?.email}</p>
        {role ? (
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {role}
          </p>
        ) : null}
      </div>
    </div>
  );
};
