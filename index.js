import express from 'express';
import router from './src/router.js';

const port = process.env.PORT || 5002;

const app = express();
app.use(express.json());
app.use('/bonami', router);

app.listen(port);
console.log('Server is running at ' + port);
