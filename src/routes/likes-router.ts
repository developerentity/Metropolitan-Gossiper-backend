import express from "express";

import gossipsController from "../controllers/gossip-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import {
  checkCommentIdValidity,
  checkGossipIdValidity,
} from "../middlewares/check-user-id-validity";

const router = express.Router();

router.post(
  "/gossip/:gossipId/like",
  checkGossipIdValidity,
  basicTokenValidator,
  gossipsController.likeGossip
);
router.delete(
  "/gossip/:gossipId/unlike",
  checkGossipIdValidity,
  basicTokenValidator,
  gossipsController.unlikeGossip
);
router.post(
  "/comment/:commentId/like",
  checkCommentIdValidity,
  basicTokenValidator,
  commentsController.likeComment
);
router.delete(
  "/comment/:commentId/unlike",
  checkCommentIdValidity,
  basicTokenValidator,
  commentsController.unlikeComment
);

export = router;
