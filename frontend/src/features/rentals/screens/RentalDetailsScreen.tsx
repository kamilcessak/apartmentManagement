import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft } from "react-icons/md";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { RentalType } from "../types/rental.types";
import { DetailsFilesSection, RentalDetailsSection } from "../components";
import { RentalInfoSection } from "../components/RentalInfoSection";

export const RentalDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handleGetRental = async () => {
    try {
      const result = await api.get<RentalType>(`/rental/${id}`);
      return result.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rental", `${id}`],
    queryFn: handleGetRental,
  });

  console.log({ data });

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
          <h1 className="text-3xl font-semibold">{`Details of rental`}</h1>
        </div>
      </header>
      <main className="flex flex-1 flex-col w-full overflow-y-scroll scrollbar-hide h-full gap-4 p-8">
        <RentalDetailsSection rental={data} />
        <RentalInfoSection rental={data} />
        <DetailsFilesSection
          files={data.photos}
          id={data._id}
          type="photos"
          title="Photos"
        />
        <DetailsFilesSection
          title="Documents"
          files={data.documents}
          id={data._id}
          type="documents"
        />
      </main>
    </RouteContent>
  );
};
