import { Router, type Request, type Response } from "express";
import { pool } from "../../db";
import { userController } from "./user.controller";


const router = Router();

export const userRoute = router;

router.post("/", userController.createUser)