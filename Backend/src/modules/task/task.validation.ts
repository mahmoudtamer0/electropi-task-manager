import Joi from "joi";

export const createTaskSchema = Joi.object({
    title: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(4000).allow("", null),
    status: Joi.string().valid("todo", "in_progress", "done"),
    priority: Joi.string().valid("low", "medium", "high"),
    dueDate: Joi.date().iso().allow(null),
    assigneeId: Joi.string().allow(null),
});

export const updateTaskSchema = Joi.object({
    title: Joi.string().min(2).max(200),
    description: Joi.string().max(4000).allow("", null),
    status: Joi.string().valid("todo", "in_progress", "done"),
    priority: Joi.string().valid("low", "medium", "high"),
    dueDate: Joi.date().iso().allow(null),
    assigneeId: Joi.string().allow(null),
}).min(1).messages({
    "object.min": "provide at least one field to update",
});