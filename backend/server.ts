import express from "express";
import cors from "cors";
import tenants from "./routes/tenants";

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/tenants", tenants);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});