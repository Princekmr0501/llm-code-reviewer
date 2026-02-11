
import express, { Application } from 'express';
import dotenv from 'dotenv';

dotenv.config({ path: 'llmkey.env' });

const app: Application = express();

app.use(express.json());

const port: number = 8080;

app.listen(port, () => {
    console.log('Working on the Server');
});

