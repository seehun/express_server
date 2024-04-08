import express from "express";
import articleRouter from "./routers/article.js";
import userRouter from "./routers/user.js";
import authRouter from "./routers/auth.js";
import { halMiddleware } from "./middlewares/hal.js";
import morgan from "morgan";

const app = express();

app.use(morgan());
app.use(express.json());
app.use(halMiddleware);

app.use(articleRouter);
app.use("/users", userRouter);
app.use("/auth", authRouter);

app.listen(3000);
