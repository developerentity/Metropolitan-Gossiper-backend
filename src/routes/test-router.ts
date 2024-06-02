import express from "express";
import { HTTP_STATUSES } from "../http-statuses";
import { testsRepo } from "../repositories/tests-repo";

export const testRouter = express.Router({});

testRouter.delete("/users", (_, res) => {
  testsRepo.clearUsers();
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
testRouter.delete("/tokens", (_, res) => {
  testsRepo.clearTokens();
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
testRouter.delete("/gossips", (_, res) => {
  testsRepo.clearGossips();
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
testRouter.delete("/comments", (_, res) => {
  testsRepo.clearComments();
  res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
});
