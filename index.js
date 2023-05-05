import express from 'express';
import router from './src/router.js';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: process.env.ADMIN_PANEL_URL,
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);

app.use(cookieParser());
app.set('trust proxy', 1);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/', router);

async function dbConnect() {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(
      `${process.env.MONGO_URL}`,
      {
        useNewUrlParser: true,
      },
      () => {}
    );
    app.listen(port, () => console.log('Server is running at ' + port));
  } catch (err) {
    console.error('ERROR: ', err);
  }
}
await dbConnect();
