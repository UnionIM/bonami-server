import express from 'express';
import router from './src/router.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 5002;

const app = express();
app.use(express.json());
app.use('/bonami', router);

async function dbConnect() {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`, {
      useNewUrlParser: true,
    });
    app.listen(port, () => console.log('Server is running at ' + port));
  } catch (err) {
    console.error('ERROR: ', err);
  }
}
await dbConnect();
