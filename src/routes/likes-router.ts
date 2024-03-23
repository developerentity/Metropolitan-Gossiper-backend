import express from "express";

import gossipsController from "../controllers/gossip-controller";
import commentsController from "../controllers/comments-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";

const router = express.Router();

router.post(
  "/gossip/:gossipId/like",
  basicTokenValidator,
  gossipsController.likeGossip
);
router.delete(
  "/gossip/:gossipId/unlike",
  basicTokenValidator,
  gossipsController.unlikeGossip
);
router.post(
  "/comment/:commentId/like",
  basicTokenValidator,
  commentsController.likeComment
);
router.delete(
  "/comment/:commentId/unlike",
  basicTokenValidator,
  commentsController.unlikeComment
);

export = router;
