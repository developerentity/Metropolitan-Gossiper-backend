import * as dotenv from "dotenv";
dotenv.config();

const { URI, PORT, SECRET_ACCESS_TOKEN, REFRESH_ACCESS_TOKEN, MAX_TOKEN_AGE } =
  process.env;
export { URI, PORT, SECRET_ACCESS_TOKEN, REFRESH_ACCESS_TOKEN, MAX_TOKEN_AGE };
