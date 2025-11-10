import express from "express";
import signUpRouter from "./router/signUp_router.js";
import loginRouter from "./router/login_router.js";
import dashBoardRouter from "./router/dash_board_router.js";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import "./util/cronDeleteTemps.js";

const app = express();
dotenv.config();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());
app.use("/sign-up", signUpRouter); // add api / version
app.use("/log-in", loginRouter);
app.use("/user", dashBoardRouter);

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

app.listen(port, function () {
  console.log(`Server running at http://:localhost:${port}/`);
});
