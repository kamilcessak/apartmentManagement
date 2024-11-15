import express, {
    NextFunction,
    Request,
    RequestHandler,
    Response,
} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/connection';

const router = express.Router();

type RegisterRequestBody = {
    login: string;
    password: string;
    email: string;
};
type LoginRequestBody = {
    login: string;
    password: string;
};

const registerHandler: RequestHandler<{}, {}, RegisterRequestBody> = async (
    req: Request<{}, {}, RegisterRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { login, password, email } = req.body;

        if (!login || !password || !email) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const collection = db.collection('users');

        const userExists = await collection.findOne({ login });
        if (userExists) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            login,
            password: hashedPassword,
            email: email.toLowerCase(),
        };

        await collection.insertOne(newUser);
        res.status(201).json({ message: 'User registered successfully' });
        return;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
};

const loginHandler: RequestHandler<{}, {}, LoginRequestBody> = async (
    req: Request<{}, {}, LoginRequestBody>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const collection = db.collection('users');
        const user = await collection.findOne({ login: req.body.login });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const passwordMatch = await bcrypt.compare(
            req.body.password,
            user.password
        );

        if (!passwordMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ login: user.login }, 'secret');
        res.status(200).json({ token });
        return;
    } catch (error) {
        res.status(500).json({ error: 'Invalid credentials' });
    }
};

router.post('/register', registerHandler);
router.post('/login', loginHandler);

export default router;
