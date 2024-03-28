import express from "express";

import controller from "../controllers/users-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";

const router = express.Router();

router.get("/get/:username", controller.readUser);
router.get("/get/", controller.readAll);
router.patch("/update/:username", basicTokenValidator, controller.updateUser);
router.delete("/delete/:username", basicTokenValidator, controller.deleteUser);

export = router;
