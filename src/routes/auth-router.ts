import { Router } from "express";

import controller from "../controllers/auth-controller";
import { loginValidator } from "../validators/loginValidator";

const router = Router();

router.post("/signup", controller.signup);
router.post("/signin", loginValidator, controller.signin);
router.get("/signout", controller.signout);

export = router;
