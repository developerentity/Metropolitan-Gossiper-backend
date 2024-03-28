import express from "express";

import controller from "../controllers/users-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import { checkUserPermission } from "../middlewares/check-user-permission";

const router = express.Router();

router.get("/get/:username", controller.readUser);
router.get("/get/", controller.readAll);
router.patch(
  "/update/:username",
  basicTokenValidator,
  checkUserPermission,
  controller.updateUser
);
router.delete(
  "/delete/:username",
  basicTokenValidator,
  checkUserPermission,
  controller.deleteUser
);

export = router;
