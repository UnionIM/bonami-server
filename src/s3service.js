import AWS from 'aws-sdk';
import * as dotenv from 'dotenv';
import multer from 'multer';
dotenv.config();

const s3Uploadv2 = async (files, itemId) => {
  const s3 = new AWS.S3();
  const params = files.map((file, index) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `upload/${itemId}/${index}.png`,
      Body: file.buffer,
    };
  });
  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

const storage = multer.memoryStorage({});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split('/')[0] === 'image') {
    cb(null, true);
  } else {
    cb(new Error('File is not of the correct type'), false);
  }
};
const upload = multer({ storage, fileFilter });

const s3Delete = async (id) => {
  const s3 = new AWS.S3();
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: `upload/${id}/`,
  };
  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await s3Delete(id);
};

export const S3DeleteManyByIndexAndRename = async (id, names) => {
  const s3 = new AWS.S3();
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: `upload/${id}/`,
  };
  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    names.forEach((name) => {
      if (Key.slice(Key.length - 5, Key.length - 4) === name.toString()) {
        deleteParams.Delete.Objects.push({ Key });
      }
    });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await s3Delete(id);
};

const S3Update = async (id, indexes) => {
  const s3 = new AWS.S3();
  const listParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: `upload/${id}/`,
  };
};

export { s3Uploadv2, upload, s3Delete, S3Update };
