import express from "express";
// import cookieParser from "cookie-parser";

import { usersRouter } from "./routes/users-router";
import { authRouter } from "./routes/auth-router";
import { gossipsRouter } from "./routes/gossips-router";

export const app = express();

app.use(express.json());
// app.use(cookieParser());

app.use("/users", usersRouter);
app.use("/auth", authRouter);
app.use("/gossips", gossipsRouter);
