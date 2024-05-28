import express from "express";

import { basicTokenValidator } from "../middlewares/basic-token-validator";
import { checkItemIdValidity } from "../middlewares/check-id-validity";
import likesController from "../controllers/likes-controller";
const router = express.Router();

router.get("/:mongoId/get", checkItemIdValidity, likesController.getItemLikes);
router.post(
  "/:mongoId/like",
  checkItemIdValidity,
  basicTokenValidator,
  likesController.likeItem
);
router.delete(
  "/:mongoId/unlike",
  checkItemIdValidity,
  basicTokenValidator,
  likesController.unlikeItem
);

export = router;
