import { S3Client } from "@aws-sdk/client-s3";
import { ACCESS_KEY, BUCKET_REGION, SECRET_ACCESS_KEY } from "../config";

export const s3 = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY!,
    secretAccessKey: SECRET_ACCESS_KEY!,
  },
  region: BUCKET_REGION!,
});
