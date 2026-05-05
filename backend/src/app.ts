import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { router } from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

const app: Application = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(helmet());
app.use(morgan('dev'));

// Health check and root
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to FinPredict API' });
});

// Routes
app.use('/api', router);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
