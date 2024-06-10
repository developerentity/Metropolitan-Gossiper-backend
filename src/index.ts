import { app } from "./app";
import Logging from "./library/Logging";
import { runDB } from "./config/db";

const port = process.env.PORT;

const startApp = async () => {
  try {
    await runDB();
    app.listen(port, () => {
      Logging.info(`Server listening on port ${port}`);
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(`Error occured: (${error.message})`);
    }
  }
};

startApp();
