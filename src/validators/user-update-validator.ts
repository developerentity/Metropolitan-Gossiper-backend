import { body } from "express-validator";

export const userUpdateValidator = [
  body("about", "The 'about' field must be maximum 300 characters").isLength({
    max: 300,
  }),
];
