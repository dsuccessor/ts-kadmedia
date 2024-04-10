import express from "express";
const router = express.Router();
import { registerUser, loginUser } from "../controller/userController";

router.post("/register", registerUser);
router.get("/auth/login", loginUser);

export default router;
