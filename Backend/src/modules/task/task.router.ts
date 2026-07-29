import express from "express";
import {
    createTask,
    listTasks,
    getTask,
    updateTask,
    deleteTask,
} from "./task.controller";
import validate from "../../middlewares/validate";
import { createTaskSchema, updateTaskSchema } from "./task.validation";


const router = express.Router({ mergeParams: true });

router.route("/")
    .post(validate(createTaskSchema), createTask)
    .get(listTasks);

router.route("/:taskId")
    .get(getTask)
    .patch(validate(updateTaskSchema), updateTask)
    .delete(deleteTask);

export default router;