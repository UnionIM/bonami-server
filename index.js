import express from 'express';
import router from './src/router.js';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';
import * as dotenv from 'dotenv';
import passport from 'passport';
import cors from 'cors';
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cookieSession({
    name: 'sessionA',
    keys: ['cat'],
    maxAge: 24 * 60 * 60 * 100,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  next();
});

app.use(
  cors({
    origin: process.env.ADMIN_PANEL_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

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
