import { body } from "express-validator";
import { usersRepo } from "../repositories/users-repo";

export const signupValidator = [
  body("firstName", "First name does not Empty").not().isEmpty(),
  body("lastName", "Second name does not Empty").not().isEmpty(),
  body("firstName", "First name must be between 2 and 50 characters").isLength({
    min: 2,
    max: 50,
  }),
  body("lastName", "Last name must be between 2 and 50 characters").isLength({
    min: 2,
    max: 50,
  }),
  body("email", "Invalid email").isEmail().not().isEmpty(),
  body("password", "Password does not Empty").not().isEmpty(),
  body("password", "The minimum password length is 8 characters").isLength({
    min: 8,
  }),
  body("about", "The 'about' field must be maximum 300 characters").isLength({
    max: 300,
  }),
  body("email").custom(async (value) => {
    const user = await usersRepo.findByEmail(value);

    if (user) {
      throw new Error("User with such email already registered");
    }
  }),
];
