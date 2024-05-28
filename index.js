import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// import User from './models/user.model'

import userRouter from './routes/user.routes.js'

dotenv.config()
const app = express();

mongoose
  .connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log("Database connected"))
  .catch((e) => console.log(e));

app.use(cors());
app.use(express.json());
app.use("/api/user", userRouter)

app.listen(process.env.PORT, () =>
  console.log(`Server running on port: ${process.env.PORT}`)
);
