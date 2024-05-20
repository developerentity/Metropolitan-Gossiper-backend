import { body } from "express-validator";

export const gossipCreateValidator = [
  body("title", "Title cannot be empty").notEmpty(),
  body("title", "The 'title' field must be maximum 40 characters").isLength({
    max: 40,
  }),
  body("content", "Content cannot be empty").notEmpty(),
  body(
    "content",
    "The 'content' field must be maximum 5000 characters"
  ).isLength({
    max: 5000,
  }),
];
