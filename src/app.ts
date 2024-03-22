import express from "express";
import cookieParser from "cookie-parser";

import { usersRouter } from "./routes/users-router";
import authRouter from "./routes/auth-router";
import gossipsRouter from "./routes/gossips-router";
import likesRouter from "./routes/likes-router";
import { loggerMiddleware } from "./middlewares/logger-middleware";
import { HTTP_STATUSES } from "./http-statuses";
import { pingRouter } from "./routes/ping-router";
import Logging from "./library/Logging";

export const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.use("/ping", pingRouter);
app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/gossips", gossipsRouter);
app.use("/likes", likesRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(HTTP_STATUSES.OK_200).json({});
  }
  next();
});

app.use((req, res, next) => {
  const error = new Error("Rout not found");
  Logging.error(error);
  return res
    .status(HTTP_STATUSES.NOT_FOUND_404)
    .json({ message: error.message });
});
