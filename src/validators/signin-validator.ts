import { body } from "express-validator";

export const signinValidator = [
  body("email", "Invalid does not Empty").not().isEmpty(),
  body("email", "Doesn't valid email").isEmail(),
  body("password", "The minimum password length is 8 characters")
    .isLength({
      min: 8,
    })
    .not()
    .isEmpty(),
];
