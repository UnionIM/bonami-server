import express from 'express';
import router from './src/router.js';
import mongoose from 'mongoose';
import session from 'express-session';
import * as dotenv from 'dotenv';
import passport from 'passport';
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(session({ secret: `${process.env.SESSION_SECRET}` }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/', router);

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
