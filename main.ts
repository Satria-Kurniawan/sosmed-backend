import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectToDatabase from "./config/database.js";
import userRouter from "./routes/userRoutes.js";
import tweetRouter from "./routes/tweetRoutes.js";

dotenv.config();
connectToDatabase();

const app: Express = express();
const port = process.env.PORT;

app.get("/", (req: Request, res: Response) => {
  res.send("Express Typescript server.");
});

app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.use("/api/user", userRouter);
app.use("/api/tweet", tweetRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
