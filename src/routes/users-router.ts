import { Router } from "express";

import controller from "../controllers/users-controller";
import { basicTokenValidator } from "../middlewares/basic-token-validator";

const router = Router({});

router.get("/get/:username", controller.readUser);
router.get("/get/", controller.readAll);
router.patch("/update/", basicTokenValidator, controller.updateUser);
router.delete("/delete/", basicTokenValidator, controller.deleteUser);

export = router;
