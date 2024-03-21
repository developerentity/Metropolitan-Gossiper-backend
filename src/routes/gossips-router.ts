import express from "express";

import gossipsController from "../controllers/gossip-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";

const router = express.Router();

router.post("/create", basicTokenValidator, gossipsController.createGossip);
router.get("/get/:gossipId", gossipsController.readGossip);
router.get("/get/", gossipsController.readAll);
router.patch(
  "/update/:gossipId",
  basicTokenValidator,
  gossipsController.updateGossip
);
router.delete(
  "/delete/:gossipId",
  basicTokenValidator,
  gossipsController.deleteGossip
);
router.post(
  "/create/:gossipId/comment",
  basicTokenValidator,
  commentsController.createComment
);
router.delete(
  "/delete/comment/:commentId",
  basicTokenValidator,
  commentsController.deleteComment
);

export = router;
