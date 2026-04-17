import { useQuery } from "@tanstack/react-query";

import api from "@services/api";
import { isAuthenticated } from "@utils/auth";
import { CurrentUser } from "../types";

export const useCurrentUser = () => {
  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const result = await api.get<CurrentUser>("/me");
      return result.data;
    },
    enabled: isAuthenticated(),
    staleTime: 60_000,
  });

  return {
    user: query.data,
    role: query.data?.role,
    isLandlord: query.data?.role === "Landlord",
    isTenant: query.data?.role === "Tenant",
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
