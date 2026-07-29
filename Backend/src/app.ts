require("dotenv").config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRouter from "./modules/auth/auth.router";
import projectRouter from "./modules/project/project.router";
import myTasksRouter from "./modules/task/myTasks.router";
import globalErrorHandler from "./middlewares/error";

const app = express();
app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(hpp());
app.use(cookieParser());

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    message: { status: "fail", message: "Too many requests, try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 5,
    message: { status: "fail", message: "Too many login attempts, try again later" }
});

app.use('/api/v1', apiLimiter);

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/projects', projectRouter);
app.use('/api/v1/tasks', myTasksRouter);

app.use(globalErrorHandler);

export default app;