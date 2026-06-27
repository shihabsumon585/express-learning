import type { Request, Response } from "express"
import { authService } from "./auth.service"


const authLogin = async (req: Request, res: Response) => {
    try {
        const result = await authService.authLoginIntoBD(req.body);

        const { refreshToken } = result;
        res.cookie("refreshToken", refreshToken, {
            secure: false,
            httpOnly: true,
            sameSite: "lax"
        })

        res.status(201).json({
            message: "json web token generated",
            data: result,
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const refreshToken = async (req: Request, res: Response) => {

    try {
        const result = await authService.generateAccessToken(req.cookies.refreshToken);

        res.status(201).json({
            success: true,
            message: "Access Token created...",
            data: result
        })
    } catch (error) {

    }
}

export const authController = {
    authLogin,
    refreshToken
}