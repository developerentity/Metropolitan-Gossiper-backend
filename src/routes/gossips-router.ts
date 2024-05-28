import express from "express";

import gossipsController from "../controllers/gossips-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import {
  checkCommentIdValidity,
  checkGossipIdValidity,
  checkItemIdValidity,
} from "../middlewares/check-id-validity";
import { gossipCreateValidator } from "../validators/gossip-create-validator";
import { validate } from "../middlewares/validate";
import { gossipUpdateValidator } from "../validators/gossip-update-validator";
import { commentCreateValidator } from "../validators/comment-create-validator";
import fileMiddleware from "../middlewares/file-middleware";
const router = express.Router();

router.post(
  "/create",
  basicTokenValidator,
  fileMiddleware,
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
  fileMiddleware,
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
router.get("/get/:gossipId/comments/", commentsController.readCommentsByGossip);
router.delete(
  "/delete/comment/:commentId",
  checkCommentIdValidity,
  basicTokenValidator,
  commentsController.deleteComment
);
router.get(
  "/get/:itemId/likes",
  checkItemIdValidity,
  gossipsController.getItemLikes
);
router.post(
  "/:itemId/like",
  checkItemIdValidity,
  basicTokenValidator,
  gossipsController.likeItem
);
router.delete(
  "/:itemId/unlike",
  checkItemIdValidity,
  basicTokenValidator,
  gossipsController.unlikeItem
);

export = router;
