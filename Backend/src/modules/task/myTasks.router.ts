import express from "express";
import { getMyTasks } from "./task.controller";
import { verifyToken } from "../../middlewares/verifyToken";

const router = express.Router();
router.use(verifyToken);
router.get("/my-tasks", getMyTasks);

export default router;