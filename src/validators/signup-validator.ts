import { body } from "express-validator";

export const signupValidator = [
  body("firstName", "First name does not Empty").not().isEmpty(),
  body("lastName", "Second name does not Empty").not().isEmpty(),
  body("email", "Invalid email").isEmail().not().isEmpty(),
  body("password", "Password does not Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
  body("about", "The 'about' field must be maximum 300 characters").isLength({
    max: 300,
  }),
];
