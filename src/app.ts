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
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const isAllowedOrigin = (origin: string | undefined) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    const hostname = url.hostname;
    const port = url.port || "80";
    const localhostPorts = ["3000", "3001", "5173", "4173"];

    return (
      (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0") &&
      localhostPorts.includes(port)
    );
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked origin: ${origin}`));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Idempotency-Key",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
    optionsSuccessStatus: 204,
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
