import { body } from "express-validator";

export const createValidator = [
  body("username", "username does not Empty").not().isEmpty(),
  body("email", "Invalid email").isEmail(),
  //   body("user.age", "username must be Alphanumeric").isAlphanumeric(),
  //   body("user.birthday", "Invalid birthday").isISO8601(), // check date is ISOString
  body("password", "password does not Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
];
