import app from "./app";
import config from "./config";
import initDB from "./db";

const { port } = config;

const main = async () => {
  await initDB();
  app.listen(port, () => {
    console.log(`Server changed is running at http://localhost:${port}`);
  });
};

main();
