import express from "express";
import articleRouter from "./routers/article.js";
import { halMiddleware } from "./middlewares/hal.js";
import morgan from "morgan";

const app = express();

app.use(morgan());
app.use(express.json());
app.use(halMiddleware);

app.use(articleRouter);

app.listen(3000);
