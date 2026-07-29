import { User } from "../../types/user";
import catchAsync from "../../utils/errors/catchAsync";
import * as projectService from "./project.services";

export const createProject = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const project = await projectService.createProject(req.body, user.id);

    return res.status(201).json({
        status: "success",
        project,
    });
});

export const listProjects = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const projects = await projectService.listProjects(user.id, user.role, req.query);

    return res.status(200).json({
        status: "success",
        projects: projects.projects,
        pagination: projects.pagination,
    });
});

export const getProject = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    const project = await projectService.getProjectById(projectId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        project,
    });
});

export const updateProject = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    const project = await projectService.updateProject(projectId as string, req.body, user.id, user.role);

    return res.status(200).json({
        status: "success",
        project,
    });
});

export const deleteProject = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    await projectService.deleteProject(projectId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        message: "project deleted",
    });
});

export const getAvailableUsersForProject = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    const users = await projectService.getAvailableUsersForProject(projectId as string, req.query, user.id, user.role);

    return res.status(200).json({
        status: "success",
        users,
    });
});

export const addMember = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    await projectService.addMember(projectId as string, req.body, user.id, user.role);

    return res.status(201).json({
        status: "success",
        message: "member added",
    });
});

export const removeMember = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId, userId } = req.params;
    await projectService.removeMember(projectId as string, userId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        message: "member removed",
    });
});

export const listMembers = catchAsync(async (req, res, next) => {
    const user = req.user as User;
    const { projectId } = req.params;
    const members = await projectService.listMembers(projectId as string, user.id, user.role);

    return res.status(200).json({
        status: "success",
        members,
    });
});