import { User } from "../../types/user";
import catchAsync from "../../utils/errors/catchAsync";
import * as taskService from "./task.services";

export const createTask = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    const task = await taskService.createTask(projectId as string, req.body, user.id, user.role);

    return res.status(201).json({
        status: "success",
        task,
    });
});

export const listTasks = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;

    const tasks = await taskService.listTasks(projectId as string, req.query, user.id, user.role);

    return res.status(200).json({
        status: "success",
        tasks,
    });
});

export const getMyTasks = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const tasks = await taskService.listMyTasks(user.id);

    return res.status(200).json({
        status: "success",
        tasks,
    });
});

export const getTask = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId, taskId } = req.params;
    const task = await taskService.getTaskById(projectId as string, taskId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        task,
    });
});

export const updateTask = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId, taskId } = req.params;

    const task = await taskService.updateTask(
        projectId as string,
        taskId as string,
        req.body,
        user.id,
        user.role
    );

    return res.status(200).json({
        status: "success",
        task,
    });
});

export const deleteTask = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId, taskId } = req.params;
    await taskService.deleteTask(projectId as string, taskId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        message: "task deleted",
    });
});