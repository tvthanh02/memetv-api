import express from "express";
import userRouter from "./user.route.js";
const rootRouter = express.Router();

rootRouter.use("/user", userRouter);

export default rootRouter;
