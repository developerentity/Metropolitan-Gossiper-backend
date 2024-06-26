import { Router } from "express";

import authController from "../controllers/auth-controller";
import usersController from "../controllers/users-controller";
import { signupValidator } from "../validators/signup-validator";
import { signinValidator } from "../validators/signin-validator";
import { validate } from "../middlewares/validate";
import { basicTokenValidator } from "../middlewares/basic-token-validator";
import { limiter } from "../middlewares/limmiter";

const router = Router();

router.post(
  "/auth/signup",
  signupValidator,
  validate,
  usersController.createUser
);
router.post("/auth/signin", signinValidator, validate, authController.signin);
router.post("/auth/refresh", authController.refreshToken);
router.get("/verify/:userId/:token", authController.verifyEmail);
router.post(
  "/verify/resend",
  limiter,
  basicTokenValidator,
  authController.resendVerification
);
router.get("/", basicTokenValidator, authController.getAuthData);
router.delete("/auth/signout", authController.signout);

export = router;
