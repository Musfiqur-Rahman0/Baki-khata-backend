import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import customerRoutes from "../modules/customers/customer.routes.js";
import transactionRoutes from "../modules/transactions/transaction.routes.js";
import aiRoutes from "../modules/ai/ai.routes.js";

const router = Router();

type TModuleRoute = {
  path: string;
  route: Router;
};

const moduleRoutes: TModuleRoute[] = [
  { path: "/auth", route: authRoutes },
  { path: "/customers", route: customerRoutes },
  { path: "/transactions", route: transactionRoutes },
  { path: "/ai", route: aiRoutes },
];

moduleRoutes.forEach((moduleRoute) => {
  router.use(moduleRoute.path, moduleRoute.route);
});

export default router;
