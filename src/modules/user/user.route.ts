import { Router } from "express";
import { userController } from "./user.controller";
import auth from "../../middleware/auth";
import { USER_ROLE } from "../../types";

const router = Router();
export const userRoute = router;

router.post("/", userController.createUser);
router.get("/", auth(USER_ROLE.admin, USER_ROLE.agent, USER_ROLE.user), userController.getAllUser);
router.get("/:id", userController.getSingleUser);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);