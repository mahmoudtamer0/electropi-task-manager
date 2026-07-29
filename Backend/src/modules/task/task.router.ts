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

// mergeParams: true lets this router read ":id" (the project id) from the
// parent router it's mounted under (project.routes.ts). Auth (protect) is
// already applied there, so we don't repeat it here.
const router = express.Router({ mergeParams: true });

router.route("/")
    .post(validate(createTaskSchema), createTask)
    .get(listTasks);

router.route("/:taskId")
    .get(getTask)
    .patch(validate(updateTaskSchema), updateTask)
    .delete(deleteTask);

export default router;