import type { Request, Response } from "express"
import { profileService } from "./profile.service"


const profileCreate = async(req: Request, res: Response) => {
    try {

        const result = await profileService.createProfileIntoDB(req.body);

        res.status(201).json({
            success: true,
            message: "Profile created successfull...",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            data: error
        })
    }
}

export const profileController = {
    profileCreate,
}