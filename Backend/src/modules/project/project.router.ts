import express from "express";
import {
    createProject,
    listProjects,
    getProject,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
    listMembers,
    getAvailableUsersForProject,
} from "./project.controller";
import validate from "../../middlewares/validate";
import { verifyToken } from "../../middlewares/verifyToken";
import { createProjectSchema, updateProjectSchema, addMemberSchema } from "./project.validation";
import taskRouter from "../task/task.router";

const router = express.Router();


router.use(verifyToken);

router.route("/")
    .post(validate(createProjectSchema), createProject)
    .get(listProjects);

router.route("/:projectId")
    .get(getProject)
    .patch(validate(updateProjectSchema), updateProject)
    .delete(deleteProject);

router.route("/:projectId/available-users")
    .get(getAvailableUsersForProject);

router.route("/:projectId/members")
    .get(listMembers)
    .post(validate(addMemberSchema), addMember);


router.route("/:projectId/members/:userId")
    .delete(removeMember);

router.use("/:projectId/tasks", taskRouter);

export default router;