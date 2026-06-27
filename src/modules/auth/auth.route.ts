import { Router, type Request, type Response } from "express";
import app from "../../app";
import { authController } from "./auth.controller";


const router = Router();

router.post("/login", authController.authLogin)
router.post("/refresh-token", authController.refreshToken)

export const authRoute = router;