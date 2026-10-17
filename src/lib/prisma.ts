import "dotenv/config.js";
import { PrismaPg } from "@prisma/adapter-pg";
import config from "../config/index.js";
import { PrismaClient } from "../generated/client/client.js";

const { connecting_string } = config;

const adapter = new PrismaPg({ connectionString: connecting_string });
const prisma = new PrismaClient({ adapter });

export { prisma };
