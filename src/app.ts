import express, { Application, Request, Response } from "express";
import routeNotFoundHandler from "./middleware/notFoundHandler";
import { errorHandler } from "./middleware/globalErrorHandler";
import router from "./routes";
import cors from "cors";
import rateLimit from "express-rate-limit";
import config from "./config/index.js";
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

app.use(
  cors({
    origin: config.FRONTEND_URL ?? "http://localhost:3000",
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
