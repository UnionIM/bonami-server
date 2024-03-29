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
  const listedObjectsChanged = await s3.listObjectsV2(listParams).promise();
  const oldKeys = [];

  listedObjectsChanged.Contents.forEach((file) => {
    oldKeys.push(file.Key);
  });

  for (const oldKey of oldKeys) {
    await s3
      .copyObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        CopySource: `${process.env.AWS_BUCKET_NAME}/${oldKey}`,
        Key: `upload/${id}/${oldKey.slice(
          oldKey.length - 5,
          oldKey.length - 4
        )}d.png`,
      })
      .promise()
      .then(() => {
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: oldKey,
        }).promise();
      })
      .catch((e) => console.log(e));
  }

  oldKeys.forEach((oldKey, newKey) => {
    s3.copyObject({
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource: `${process.env.AWS_BUCKET_NAME}/upload/${id}/${oldKey.slice(
        oldKey.length - 5,
        oldKey.length - 4
      )}d.png`,
      Key: `upload/${id}/${newKey}.png`,
    })
      .promise()
      .then(() => {
        s3.deleteObject({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: `upload/${id}/${oldKey.slice(
            oldKey.length - 5,
            oldKey.length - 4
          )}d.png`,
        }).promise();
      })
      .catch((e) => {
        console.log(e);
      });
  });

  if (listedObjects.IsTruncated) await s3Delete(id);
};

const s3Update = async (itemId, indexes, files) => {
  const s3 = new AWS.S3();
  const params = indexes.map((name, index) => {
    return {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `upload/${itemId}/${name}.png`,
      Body: files[index].buffer,
    };
  });
  return await Promise.all(params.map((param) => s3.upload(param).promise()));
};

export { s3Uploadv2, upload, s3Delete, s3Update };
