import express from "express";

import gossipsController from "../controllers/gossip-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import {
  checkCommentIdValidity,
  checkGossipIdValidity,
} from "../middlewares/check-user-id-validity";

const router = express.Router();

router.post("/create", basicTokenValidator, gossipsController.createGossip);
router.get("/get/:gossipId", gossipsController.readGossip);
router.get("/get/", gossipsController.readAll);
router.patch(
  "/update/:gossipId",
  checkGossipIdValidity,
  basicTokenValidator,
  gossipsController.updateGossip
);
router.delete(
  "/delete/:gossipId",
  checkGossipIdValidity,
  basicTokenValidator,
  gossipsController.deleteGossip
);
router.post(
  "/create/:gossipId/comment",
  checkGossipIdValidity,
  basicTokenValidator,
  commentsController.createComment
);
router.delete(
  "/delete/comment/:commentId",
  checkCommentIdValidity,
  basicTokenValidator,
  commentsController.deleteComment
);

export = router;
