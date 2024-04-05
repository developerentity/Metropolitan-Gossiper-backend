import { Router } from "express";

import authController from "../controllers/auth-controller";
import usersController from "../controllers/users-controller";
import { signupValidator } from "../validators/signup-validator";
import { signinValidator } from "../validators/signin-validator";
import { validate } from "../middlewares/validate";
import { basicTokenValidator } from "../middlewares/basic-token-validator";

const router = Router();

router.post(
  "/auth/signup",
  signupValidator,
  validate,
  usersController.createUser
);
router.post("/auth/signin", signinValidator, validate, authController.signin);
router.post("/refresh", authController.refresh);
router.get("/", basicTokenValidator, authController.getAuthData);
router.delete("/auth/signout", authController.signout);

export = router;
