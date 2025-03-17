import { Button, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Typography } from "@mui/material";
import { MdVisibility } from "react-icons/md";

import { RouteContent } from "../../components/common";
import api from "../../services/api";
import { ApartmentListItem } from "../../components/apartment";
import { getApartmentIdFromAddress } from "../../utils/apartment";

export const ApartmentsScreen = () => {
  const navigate = useNavigate();
  const handleAddNewApartment = () => navigate("/apartments/new");

  const handleGetApartments = async () => {
    const result = await api.get("http://localhost:5050/apartments");
    return result.data;
  };

  const { data, isLoading } = useQuery({
    queryKey: ["apartments", "list"],
    queryFn: handleGetApartments,
  });

  if (isLoading) {
    return (
      <RouteContent
        sectionStyle={{ alignItems: "center", justifyContent: "center" }}
      >
        <CircularProgress size={64} />
      </RouteContent>
    );
  }

  return (
    <RouteContent>
      <header className="flex flex-row justify-between items-center">
        <h1 className="text-3xl font-semibold">{`List of your apartments`}</h1>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleAddNewApartment}
        >
          {`Add new apartment`}
        </Button>
      </header>
      <main className="mt-4">
        {data?.length ? (
          <>
            <section
              className="flex flex-1 flex-row items-center justify-between border-gray-200"
              style={{ borderBottomWidth: 1 }}
            >
              <Typography
                variant="subtitle1"
                className="flex border-gray-200 py-4"
                style={{ flex: 2, borderRightWidth: 1 }}
              >
                ID
              </Typography>
              <Typography
                variant="subtitle1"
                className="flex border-gray-200 py-4"
                style={{ flex: 4, borderRightWidth: 1, paddingLeft: 8 }}
              >
                Apartment address
              </Typography>
              <Typography
                variant="subtitle1"
                className="flex border-gray-200 py-4"
                style={{ flex: 1, borderRightWidth: 1, paddingLeft: 8 }}
              >
                Metric
              </Typography>
              <Typography
                variant="subtitle1"
                className="flex border-gray-200 py-4"
                style={{ flex: 1, borderRightWidth: 1, paddingLeft: 8 }}
              >
                Status
              </Typography>
              <Typography
                variant="subtitle1"
                className="flex border-gray-200 py-4"
                style={{ flex: 1, paddingLeft: 8 }}
              >
                Actions
              </Typography>
            </section>
            <section className="flex flex-col">
              {data.map((e, i) => (
                <div
                  key={`apartment-${e._id}-${i}`}
                  className="flex flex-1 flex-row items-center justify-between border-gray-200 py-4"
                  style={{ borderBottomWidth: i < data.length - 1 ? 1 : 0 }}
                >
                  <ApartmentListItem
                    isFirst
                    title={getApartmentIdFromAddress(e.address)}
                    flex={2}
                  />
                  <ApartmentListItem title={e.address} flex={4} />
                  <ApartmentListItem title={e.metric} flex={1} />
                  <ApartmentListItem title={`${e.isAvailable}`} flex={1} />
                  <ApartmentListItem
                    content={
                      <a href={`/apartment/${e._id}`}>
                        <MdVisibility size={24} />
                      </a>
                    }
                    flex={1}
                  />
                </div>
              ))}
            </section>
          </>
        ) : (
          <section>Brak dodanych apartamentów</section>
        )}
      </main>
    </RouteContent>
  );
};
