import express, { Request, Response } from "express";
import dotenv from "dotenv";
import auth from  './auth/auth'

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.use(auth)

app.listen(port, () => {
  console.log(`Auth server running on port ${port}.`);
});