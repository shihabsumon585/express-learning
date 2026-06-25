import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./user.service";


const createUser = async (req: Request, res: Response) => {
    // console.log(req.body);
    // const { name, email, password, age } = req.body;
    // console.log({ name, email, password, age })

    try {
        
        const result = await userService.createUserIntoDB(req.body)

        res.status(201).json({
            message: "Created...",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(201).json({
            message: error.message,
            error: error
        })
    }
}

export const userController = {
    createUser,
}