import express from "express";

import gossipsController from "../controllers/gossips-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import {
  checkCommentIdValidity,
  checkGossipIdValidity,
} from "../middlewares/check-user-id-validity";
import { gossipCreateValidator } from "../validators/gossip-create-validator";
import { validate } from "../middlewares/validate";
import { gossipUpdateValidator } from "../validators/gossip-update-validator";
import { commentCreateValidator } from "../validators/comment-create-validator";
const router = express.Router();

router.post(
  "/create",
  basicTokenValidator,
  gossipCreateValidator,
  validate,
  gossipsController.createGossip
);
router.get("/get/:gossipId", gossipsController.readGossip);
router.get("/get/", gossipsController.readAll);
router.patch(
  "/update/:gossipId",
  checkGossipIdValidity,
  basicTokenValidator,
  gossipUpdateValidator,
  validate,
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
  commentCreateValidator,
  validate,
  commentsController.createComment
);
router.delete(
  "/delete/comment/:commentId",
  checkCommentIdValidity,
  basicTokenValidator,
  commentsController.deleteComment
);

export = router;
