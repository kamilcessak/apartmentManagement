import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { EmptyView, LoadingView, RouteContent } from "@components/common";
import { ErrorView } from "@components/common";
import api from "@services/api";
import { ApartmentType } from "../types/apartment.type";
import { ApartmentItem } from "../components/ApartmentItem";

export const ApartmentsScreen = () => {
  const navigate = useNavigate();
  const handleAddNewApartment = () => navigate("/apartments/new");

  const handleGetApartments = async () => {
    try {
      const result = await api.get<ApartmentType[]>("/apartments");
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["apartments", "list"],
    queryFn: handleGetApartments,
  });

  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView message={error?.message} onClick={refetch} />;

  return (
    <RouteContent>
      <div className="flex h-full flex-col bg-slate-50">
        <header className="flex flex-row items-center justify-between border-b border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-semibold text-slate-900">
            {`List of your apartments`}
          </h1>
          <Button variant="default" onClick={handleAddNewApartment}>
            <Plus className="mr-2 h-4 w-4" />
            {`Add new apartment`}
          </Button>
        </header>
        <main className="scrollbar-hide flex h-full flex-col gap-4 overflow-y-scroll bg-slate-50 p-8">
          {data?.length ? (
            data.map((e, i) => (
              <ApartmentItem
                apartment={e}
                key={`apartment-item-${e._id}-${i}`}
              />
            ))
          ) : (
            <EmptyView message="No apartments added yet" />
          )}
        </main>
      </div>
    </RouteContent>
  );
};
