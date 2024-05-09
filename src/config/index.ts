import * as dotenv from "dotenv";
dotenv.config();

const {
  URI,
  PORT,
  SECRET_ACCESS_TOKEN,
  REFRESH_ACCESS_TOKEN,
  EXPIRES_TOKEN,
  EXPIRES_REFRESH_TOKEN,
} = process.env;
export {
  URI,
  PORT,
  SECRET_ACCESS_TOKEN,
  REFRESH_ACCESS_TOKEN,
  EXPIRES_TOKEN,
  EXPIRES_REFRESH_TOKEN,
};
