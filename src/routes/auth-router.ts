import { Router } from "express";

import authController from "../controllers/auth-controller";
import usersController from "../controllers/users-controller";
import { signupValidator } from "../validators/signup-validator";
import { signinValidator } from "../validators/signin-validator";
import { validate } from "../middlewares/validate";

const router = Router();

router.post("/signup", signupValidator, validate, usersController.createUser);
router.post("/signin", signinValidator, validate, authController.signin);
router.get("/signout", authController.signout);

export = router;
