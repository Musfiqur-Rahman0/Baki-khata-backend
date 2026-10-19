import express, { Application, Request, Response } from "express";
import routeNotFoundHandler from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/globalErrorHandler";
import router from "./routes";
import cors from "cors";
import rateLimit from "express-rate-limit";
// import config from "./config/index.js";
import { AppErrors } from "./shared/erors/app.errors.js";

const app: Application = express();
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(AppErrors.tooManyRequests());
  },
});

const allowedOrigins = [
  "https://baki-khata-frontend-two.vercel.app",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req: Request, res: Response) => {
  res.send("বাকি খাতা API চালু আছে");
});

app.use("/api/v1", apiLimiter, router);

app.use(routeNotFoundHandler);
app.use(errorHandler);

export default app;
