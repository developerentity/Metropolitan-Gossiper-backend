import { app } from "./app";
import { runDB } from "./repositories/db";

const port = process.env.PORT;

const startApp = async () => {
  await runDB();
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
};

startApp();
