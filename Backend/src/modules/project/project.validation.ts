import Joi from "joi";

export const createProjectSchema = Joi.object({
    name: Joi.string().min(2).max(160).required(),
    description: Joi.string().max(2000).allow("", null),
});

export const updateProjectSchema = Joi.object({
    name: Joi.string().min(2).max(160),
    description: Joi.string().max(2000).allow("", null),
}).min(1).messages({
    "object.min": "provide at least one field to update",
});

export const addMemberSchema = Joi.object({
    userId: Joi.string().required().messages({
        "any.required": "userId is required",
    }),
    roleInProject: Joi.string().valid("admin", "member"),
});