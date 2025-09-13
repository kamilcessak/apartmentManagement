import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";

import {
  DetailsPhotosSection,
  DetailsDescriptionSection,
  DetailsInformationsSection,
} from "../components";
import { ApartmentType } from "../types/apartment.type";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { getApartmentIdFromAddress } from "@utils/apartment";
import { capitalizeFirstLetter } from "@utils/common";

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
      <header className="flex flex-row items-center p-8 border-b-2 border-gray-200">
        <a className="cursor-pointer" onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl font-semibold">
            {`Details of: ${capitalizeFirstLetter(
              getApartmentIdFromAddress(data.address)
            )}`}
          </h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <DetailsInformationsSection data={data} />
        <DetailsDescriptionSection
          description={data.description}
          id={data._id}
        />
        <DetailsPhotosSection
          files={data.photos}
          id={data._id}
          type="photos"
          title="Photos"
        />
        <DetailsPhotosSection
          title="Documents"
          files={data.documents}
          id={data._id}
          type="documents"
        />
      </main>
    </RouteContent>
  );
};
