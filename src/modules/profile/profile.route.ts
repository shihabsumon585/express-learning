import { Router } from "express";
import { profileController } from "./profile.controller";

const router = Router();

router.post("/", profileController.profileCreate)

export const profileRoute = router;