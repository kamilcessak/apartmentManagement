import { MdChevronLeft } from "react-icons/md";
import { Button, CircularProgress, TextField, useTheme } from "@mui/material";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { RouteContent } from "../../components/common";
import api from "../../services/api";
import { FilesSection } from "../../components/files";

const schema = yup.object().shape({
  address: yup.string().required("Address of your apartment is required"),
  metric: yup.number().required("Metric of your apartment is required"),
  roomCount: yup.number().required("Rooms count of your apartment is required"),
  monthlyCost: yup
    .number()
    .required("Monthly cost of renting your apartment is required"),
  description: yup.string().required("Description field is required"),
  equipment: yup.string(),
});

type FormValues = {
  address: string;
  metric: number;
  roomCount: number;
  monthlyCost: number;
  description: string;
  equipment?: string;
  photos?: string[];
  documents?: string[];
};

export const NewApartmentScreen = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
  });

  const handleAddPhotoToForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    setValue("photos", [...currentPhotos, url]);
  };

  const handleRemovePhotoFromForm = (url: string) => {
    const currentPhotos = watch("photos") || [];
    const result = currentPhotos.filter((e) => e !== url);
    setValue("photos", [...result]);
  };

  const handleAddDocumentToForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    setValue("documents", [...currentDocuments, url]);
  };

  const handleRemoveDocumentFromForm = (url: string) => {
    const currentDocuments = watch("documents") || [];
    const result = currentDocuments.filter((e) => e !== url);
    setValue("documents", [...result]);
  };

  const handlePostApartment = async (data: FormValues) => {
    const result = await api.post("http://localhost:5050/apartment", data);
    return result;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: handlePostApartment,
    onSuccess: (data) => {
      if (data.status === 201) {
        queryClient.invalidateQueries({ queryKey: ["apartments", "list"] });
        toast("Apartment added successfully", { type: "success" });
        navigate(-1);
      }
    },
    onError: () => {
      toast("Wystąpił błąd podczas dodawania apartamentu", { type: "error" });
    },
  });

  const onSubmit = (data: FormValues) => {
    mutate(data);
  };

  return (
    <RouteContent sectionStyle={{ height: "100vh" }}>
      <header className="flex flex-row items-center">
        <a onClick={() => navigate(-1)}>
          <MdChevronLeft size={48} />
        </a>
        <div className="flex flex-1 items-center justify-center">
          <h1 className="text-3xl">Add new apartment</h1>
        </div>
      </header>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 overflow-y-hidden flex-col pl-12 items-center"
      >
        <div
          className="flex flex-1 flex-col pt-8 w-1/2 overflow-y-scroll h-full gap-4"
          style={{
            paddingRight: "8px",
            scrollbarWidth: "thin",
            scrollbarColor: `${theme.palette.gray.main} transparent`,
            "&::WebkitScrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::WebkitScrollbarTrack": {
              background: "transparent",
              marginRight: "8px",
            },
            "&::WebkitScrollbarThumb": {
              backgroundColor: theme.palette.gray.main,
              borderRadius: "4px",
            },
          }}
        >
          <TextField
            disabled={isPending}
            label="Address"
            variant="outlined"
            {...register("address")}
            error={!!errors.address}
            helperText={errors.address?.message}
          />
          <TextField
            disabled={isPending}
            label="Metric"
            variant="outlined"
            type="number"
            {...register("metric")}
            error={!!errors.metric}
            helperText={errors.metric?.message}
          />
          <TextField
            disabled={isPending}
            label="Rooms count"
            variant="outlined"
            type="number"
            {...register("roomCount")}
            error={!!errors.roomCount}
            helperText={errors.roomCount?.message}
          />
          <TextField
            disabled={isPending}
            label="Monthly cost"
            variant="outlined"
            {...register("monthlyCost")}
            error={!!errors.monthlyCost}
            helperText={errors.monthlyCost?.message}
          />
          <TextField
            disabled={isPending}
            label="Description"
            variant="outlined"
            multiline
            minRows={6}
            {...register("description")}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <TextField
            disabled={isPending}
            multiline
            minRows={3}
            label="Equipment"
            variant="outlined"
            {...register("equipment")}
            error={!!errors.equipment}
            helperText={errors.equipment?.message}
          />
          <FilesSection
            title={"Photos"}
            handleAddForm={handleAddPhotoToForm}
            handleRemoveForm={handleRemovePhotoFromForm}
          />
          <FilesSection
            title={"Documents"}
            handleAddForm={handleAddDocumentToForm}
            handleRemoveForm={handleRemoveDocumentFromForm}
          />
          <div className="flex flex-row justify-between gap-2">
            <Button
              color="success"
              size="large"
              type="submit"
              disabled={isPending}
              startIcon={isPending ? <CircularProgress size={20} /> : null}
              variant="contained"
              className="flex flex-1"
            >{`Save`}</Button>
            <Button
              variant="outlined"
              size="large"
              disabled={isPending}
              onClick={() => navigate(-1)}
              className="flex flex-1"
            >{`Cancel`}</Button>
          </div>
        </div>
      </form>
    </RouteContent>
  );
};
