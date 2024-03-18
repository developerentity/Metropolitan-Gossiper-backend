import { Router } from "express";

export const pingRouter = Router({});

pingRouter.get("/", (req, res, next) =>
  res.status(200).json({ message: "pong" })
);
