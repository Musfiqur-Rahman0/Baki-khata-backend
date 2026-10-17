import { prisma } from "../lib/prisma";


const initDB = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established successfully.");
  } catch (error) {
    console.error("❌ Failed to connect to the database.");
    console.error(error);
    process.exit(1);
  }
};

export default initDB;