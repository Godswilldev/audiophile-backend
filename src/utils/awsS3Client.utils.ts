import "dotenv/config";
import S3 from "aws-sdk/clients/s3";

const {
  AWS_S3_SECRET: secretAccessKey,
  AWS_S3_ACCESS_KEY: accessKeyId,
  AWS_S3_BUCKET_NAME: bucketName,
  AWS_S3_REGION: region,
} = process.env;

export const s3 = new S3({
  credentials: {
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
  },
  region,
});

export interface UploadProps {
  Body: Buffer;
  Key: string;
  ContentType: any;
}

// AWS FILE UPLOAD FUNCTION
export const uploadToS3 = async ({ Body, ContentType, Key }: UploadProps) => {
  const params = { Bucket: bucketName as string, Key, Body, ContentType };
  const { Location } = await s3.upload(params).promise();
  return Location;
};
