import { RouteContent } from "./RouteContent.tsx";
import { ActivityIndicator } from "./ActivityIndicator.tsx";

export const LoadingView = () => (
  <RouteContent
    sectionStyle={{ alignItems: "center", justifyContent: "center" }}
  >
    <ActivityIndicator style={{ width: "20%", height: "20%" }} />
  </RouteContent>
);
