import { app } from "./app";
import Logging from "./library/Logging";
import { runDB } from "./repositories/db";

const port = process.env.PORT;

const startApp = async () => {
  await runDB();
  app.listen(port, () => {
    Logging.info(`Server listening on port ${port}`);
  });
};

startApp();
