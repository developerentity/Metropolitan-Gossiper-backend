import express from "express";

import controller from "../controllers/users-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import { checkUserPermission } from "../middlewares/check-user-permission";
import { checkUserIdValidity } from "../middlewares/check-user-id-validity";

const router = express.Router();

router.get("/get/:userId", controller.readUser);
router.get("/get/", controller.readAll);
router.patch(
  "/update/:userId",
  checkUserIdValidity,
  basicTokenValidator,
  checkUserPermission,
  controller.updateUser
);
router.delete(
  "/delete/:userId",
  checkUserIdValidity,
  basicTokenValidator,
  checkUserPermission,
  controller.deleteUser
);

export = router;
