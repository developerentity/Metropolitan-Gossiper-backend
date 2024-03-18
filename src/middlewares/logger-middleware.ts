import { NextFunction, Request, Response } from "express";
import Logging from "../library/Logging";

export const loggerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /** Log the Request */
  Logging.info(
    `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
  );
  res.on("finish", () => {
    /** Log the Response */
    Logging.info(
      `Incoming -> Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`
    );
  });

  next();
};
