import express from 'express';
import cors from 'cors';
import tenants from './routes/tenants';
import authorizationRoutes from './routes/authorization';

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use('/tenants', tenants);
app.use('/', authorizationRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
