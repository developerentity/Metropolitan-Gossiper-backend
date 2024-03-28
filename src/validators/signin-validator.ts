import { body } from "express-validator";

export const signinValidator = [
  body("loginOrEmail", "Invalid does not Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters")
    .isLength({
      min: 8,
    })
    .not()
    .isEmpty(),
];
