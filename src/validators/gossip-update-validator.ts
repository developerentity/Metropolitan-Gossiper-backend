import { body } from "express-validator";

export const gossipUpdateValidator = [
  body("content", "Content cannot be empty").notEmpty(),
  body(
    "content",
    "The 'content' field must be maximum 5000 characters"
  ).isLength({
    max: 5000,
  }),
];
