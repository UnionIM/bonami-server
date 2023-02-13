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

export { s3Uploadv2, upload };
