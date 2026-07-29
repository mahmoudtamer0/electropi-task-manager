import catchAsync from "../../utils/errors/catchAsync";
import * as authService from "./auth.services"


export const register = catchAsync(async (req, res, next) => {

    await authService.register(req.body)

    return res.status(200).json({
        status: "success",
        message: "User registered. Please verify your email.",
    })

})

export const verifyEmail = catchAsync(async (req, res, next) => {
    const device = req.headers["user-agent"] || ""
    const verfied = await authService.verifyEmail(req.body, device)

    return res.status(200).json({
        status: "success",
        token: verfied.token,
        user: {
            id: verfied.user.id,
            name: verfied.user.name,
            email: verfied.user.email,
        }
    })
})

export const resendOtp = catchAsync(async (req, res, next) => {

    await authService.resendOtp(req.body)

    return res.status(200).json({
        status: "success",
        message: "User registered. Please verify your email.",
    })
})

export const login = catchAsync(async (req, res, next) => {

    const device = req.headers["user-agent"] || ""
    const user = await authService.login(req.body, device)

    return res.status(200).json({
        status: "success",
        message: "User logined. Please verify your email.",
        token: user.token,
        user: {
            id: user.findUser.id,
            name: user.findUser.name,
            email: user.findUser.email,
        }
    })

})