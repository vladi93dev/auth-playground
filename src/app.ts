import express from 'express';
import authRouter from './auth/auth.routes.js';

const app = express();

app.use(express.json());

app.use("/auth", authRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


export default  app;
