import { body } from "express-validator";

export const loginValidator = [
  body("loginOrEmail", "Invalid does not Empty").not().isEmpty(),
  //   body("email", "Invalid email").isEmail(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
];
