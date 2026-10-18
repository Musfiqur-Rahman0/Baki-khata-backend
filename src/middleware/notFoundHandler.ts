import type { NextFunction, Request, Response } from "express";
import { AppErrors } from "../shared/erors/app.errors";

const routeNotFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  void req;
  void res;
  next(AppErrors.notFound("Route"));
};

export default routeNotFoundHandler;
