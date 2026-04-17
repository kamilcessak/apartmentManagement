import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { MdChevronLeft, MdStop } from "react-icons/md";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { toast } from "react-toastify";

import { ErrorView, LoadingView, RouteContent } from "@components/common";
import api from "@services/api";
import { RentalType } from "../types/rental.types";
import { DetailsFilesSection, RentalDetailsSection } from "../components";
import { RentalInfoSection } from "../components/RentalInfoSection";

export const RentalDetailsScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const { mutate: endRental, isPending: isEnding } = useMutation({
    mutationFn: async () => {
      const result = await api.post(`/rental/${id}/end`);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rental", `${id}`] });
      queryClient.invalidateQueries({ queryKey: ["rentals"] });
      queryClient.invalidateQueries({ queryKey: ["apartments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast("Rental ended successfully", { type: "success" });
      setConfirmOpen(false);
    },
    onError: () => {
      toast("An error occurred while ending the rental", { type: "error" });
    },
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
        <div className="flex flex-1 flex-row items-center justify-center gap-3">
          <h1 className="text-3xl font-semibold">{`Details of rental`}</h1>
          <Chip
            size="small"
            label={data.isActive ? "Active" : "Ended"}
            color={data.isActive ? "success" : "default"}
          />
        </div>
        {data.isActive ? (
          <Button
            color="error"
            variant="outlined"
            startIcon={
              isEnding ? <CircularProgress size={16} /> : <MdStop size={20} />
            }
            disabled={isEnding}
            onClick={() => setConfirmOpen(true)}
            style={{ textTransform: "none" }}
          >
            End rental
          </Button>
        ) : null}
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

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>End this rental?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Ending the rental will mark it as inactive and release the linked
            apartment as available. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            style={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => endRental()}
            disabled={isEnding}
            startIcon={isEnding ? <CircularProgress size={16} /> : null}
            style={{ textTransform: "none" }}
          >
            End rental
          </Button>
        </DialogActions>
      </Dialog>
    </RouteContent>
  );
};
