import { Router } from "express";

import authController from "../controllers/auth-controller";
import usersController from "../controllers/users-controller";

const router = Router();

router.post("/signup", usersController.createUser);
router.post("/signin", authController.signin);
router.get("/signout", authController.signout);

export = router;
