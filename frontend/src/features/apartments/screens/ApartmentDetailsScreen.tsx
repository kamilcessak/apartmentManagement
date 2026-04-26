import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import {
  DetailsPhotosSection,
  DetailsDescriptionSection,
  DetailsInformationsSection,
} from "../components";
import { ApartmentType } from "../types/apartment.type";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import { Button } from "@/components/ui/button";
import api from "@services/api";
import { getApartmentShortLabel } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";
import { ApartmentInvoicesSection } from "@features/invoices/components";

export const ApartmentDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGetApartment = async () => {
    try {
      const result = await api.get<ApartmentType>(`/apartment/${id}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["apartment", `${id}`],
    queryFn: handleGetApartment,
  });

  if (isLoading) return <LoadingView />;
  if (isError || !data)
    return <ErrorView message={`${error?.message}`} onClick={refetch} />;

  return (
    <RouteContent>
      <div className="flex flex-col flex-1 min-h-0 bg-slate-50">
        <header className="flex flex-row items-center px-8 py-5 border-b border-slate-200 bg-white">
          <Button
            variant="ghost"
            size="icon"
            className="mr-4"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ChevronLeft className="!size-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {capitalizeFirstLetter(getApartmentShortLabel(data))}
            </h1>
            <p className="text-sm text-slate-500">
              Edytuj szczegóły i parametry mieszkania
            </p>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-6 w-full overflow-y-auto scrollbar-hide p-8">
          <DetailsInformationsSection data={data} />
          <DetailsDescriptionSection
            description={data.description}
            id={data._id}
          />
          <DetailsPhotosSection
            files={data.photos}
            id={data._id}
            type="photos"
          />
          <DetailsPhotosSection
            files={data.documents}
            id={data._id}
            type="documents"
          />
          <ApartmentInvoicesSection apartmentID={data._id} />
        </main>
      </div>
    </RouteContent>
  );
};
