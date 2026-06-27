import type { Request, Response } from "express";
import { pool } from "../../db";
import { userService } from "./user.service";
import sendResponse from "../../utility/sendResponse";


const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.createUserIntoDB(req.body)
        // res.status(201).json({
        //     message: "Created...",
        //     data: result.rows[0]
        // })
        sendResponse(res, {
            statusCode: 201,
            success: true,
            message: "Created...",
            data: result.rows[0]
        })
    } catch (error: any) {
        // res.status(201).json({
        //     message: error.message,
        //     error: error
        // })
        sendResponse(res, {
            statusCode: 500,
            success: false,
            message: error.message,
            error: error
        })
    }
}

const getAllUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.getAllUserFromDB();
        res.status(200).json({
            success: true,
            message: "Users retrived successfully!",
            data: result.rows
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const getSingleUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    // console.log(id); // undefined... but why?
    try {
        const result = await userService.getSingleUserFromBD(id as string)

        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found!",
                data: {}
            })
            return;
        }

        res.status(200).json({
            success: true,
            message: "User retrived successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await userService.updateUserFromDB(req.body, id as string);
        if (result.rows.length === 0) {
            res.status(404).json({
                success: false,
                message: "User not found!",
                data: {}
            })
        }
        res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await userService.deleteUserFromDB(id as string);
        console.log(result)
        if (result.rowCount === 0) {
            res.status(404).json({
                success: false,
                message: "User not found!",
                data: {}
            })
        }
        res.status(200).json({
            success: true,
            message: "User delete successfully",
            data: {}
        })
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message,
            error: error
        })
    }
}

export const userController = {
    createUser,
    getAllUser,
    getSingleUser,
    updateUser,
    deleteUser
}