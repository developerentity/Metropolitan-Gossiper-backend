import { NextFunction, Request, Response } from "express";
import multer from "multer";
import { HTTP_STATUSES } from "../http-statuses";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

function fileUploadMiddleware(req: Request, res: Response, next: NextFunction) {
  upload.single("image")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(HTTP_STATUSES.BAD_REQUEST_400)
        .send("Error loading file");
    } else if (err) {
      return res
        .status(HTTP_STATUSES.INTERNAL_SERVER_ERROR_500)
        .send("An error occurred on the server");
    }
    next();
  });
}

export default fileUploadMiddleware;
