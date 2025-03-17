import { createTheme } from "@mui/material/styles";
import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.js";

const fullConfig = resolveConfig(tailwindConfig);
const colors = fullConfig.theme.colors;

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.DEFAULT,
      contrastText: "#ffffff",
    },
    warning: {
      main: colors.warning.DEFAULT,
      light: colors.warning.light,
    },
    success: {
      main: colors.success.DEFAULT,
      light: colors.success.light,
    },
    gray: {
      main: colors.gray.DEFAULT,
      light: colors.gray.light,
    },
  },
});

export default theme;
