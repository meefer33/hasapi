import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import auth from  './auth/auth'

const port = process.env.PORT || 3000;
app.use(express.json());

app.get('/auth', (req, res) => {
  res.send('Webhooks are running');
});

app.use(auth)

app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`);
});