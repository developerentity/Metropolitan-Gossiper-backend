import { body } from "express-validator";

export const commentCreateValidator = [
  body("content", "Content cannot be empty").notEmpty(),
  body(
    "content",
    "The 'content' field must be maximum 300 characters"
  ).isLength({
    max: 300,
  }),
];
