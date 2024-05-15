import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { BUCKET_NAME } from "../config";
import { s3 } from "../application/s3-adapter";
import sharp from "sharp";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const getImageNameWithDate = (imageName: string): string =>
  imageName.concat(new Date().toString());

export const s3Manager = {
  async sendFile(
    name: string,
    file: Buffer,
    contentType: string
  ): Promise<string | null> {
    const imageName = getImageNameWithDate(name);

    const buffer = await sharp(file).resize({
      height: 1920,
      width: 1080,
      fit: "contain",
    });

    const params = {
      Bucket: BUCKET_NAME!,
      Key: imageName,
      Body: buffer,
      ContentType: contentType,
    };

    const command = new PutObjectCommand(params);
    await s3.send(command);

    return imageName;
  },
  async getFile(imageName: string) {
    const getObjectParams = {
      Bucket: BUCKET_NAME!,
      Key: imageName,
    };

    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    return url;
  },
  async deleteFile(fileName: string) {
    const params = {
      Bucket: BUCKET_NAME!,
      Key: fileName,
    };

    const command = new DeleteObjectCommand(params);
    const res = await s3.send(command);
    return res;
  },
};
