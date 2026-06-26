import type { Request, Response } from "express"
import { authService } from "./auth.service"


const authLogin = async (req: Request, res: Response) => {
    try {
        const result = await authService.authLoginIntoBD(req.body);
        
        res.status(201).json({
            message: "json web token generated",
            data: result
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

export const authController = {
    authLogin,
}