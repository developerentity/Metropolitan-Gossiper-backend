import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET_NAME } from "../config";
import { s3 } from "../application/s3-adapter";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as crypto from "crypto";
import { imageSizeManager } from "./image-size-manager";
import Logging from "../library/Logging";

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const s3Manager = {
  async create(file: {
    size: number;
    buffer: Buffer;
    mimetype: string;
  }): Promise<string | null> {
    try {
      const imageName = generateFileName();

      const croppedImgBuffer = await imageSizeManager.contain(
        file.buffer,
        1080,
        1920
      );

      const params = {
        Bucket: BUCKET_NAME!,
        Key: imageName,
        Body: croppedImgBuffer,
        ContentType: file.mimetype,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      return imageName;
    } catch (error) {
      Logging.error("S3 Manager error ======== " + error);
      return null;
    }
  },
  async read(name: string) {
    try {
      const getObjectParams = {
        Bucket: BUCKET_NAME!,
        Key: name,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return url;
    } catch (error) {
      Logging.error("S3 Manager error ======== " + error);
      return null;
    }
  },
  async delete(name: string) {
    try {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: name,
      };

      const command = new DeleteObjectCommand(params);
      const res = await s3.send(command);
      return res;
    } catch (error) {
      Logging.error("S3 Manager error ======== " + error);
      return null;
    }
  },
};
