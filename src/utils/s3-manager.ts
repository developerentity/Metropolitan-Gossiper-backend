import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET_NAME } from "../config";
import { s3 } from "../application/s3-adapter";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Jimp from "jimp";
import { randomUUID } from "crypto";

// const getImageNameWithDate = (imageName: string): string =>
//   imageName.concat(new Date().toString());

export const s3Manager = {
  async create(
    name: string,
    file: Buffer,
    contentType: string
  ): Promise<string | null> {
    if (name) {
      const imageName = randomUUID.toString();

      const image = await Jimp.read(file);
      image.contain(1080, 1920);

      const buffer = await image.getBufferAsync(Jimp.MIME_PNG);

      const params = {
        Bucket: BUCKET_NAME!,
        Key: imageName,
        Body: buffer,
        ContentType: contentType,
      };

      const command = new PutObjectCommand(params);
      await s3.send(command);

      return imageName;
    }
    return null;
  },
  async read(name: string | undefined) {
    if (name) {
      const getObjectParams = {
        Bucket: BUCKET_NAME!,
        Key: name,
      };

      const command = new GetObjectCommand(getObjectParams);
      const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
      return url;
    }
    return null;
  },
  async delete(name: string) {
    if (name) {
      const params = {
        Bucket: BUCKET_NAME!,
        Key: name,
      };

      const command = new DeleteObjectCommand(params);
      const res = await s3.send(command);
      return res;
    }
    return null;
  },
};
