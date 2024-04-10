import { Router } from "express";
import { createPost, userFeed } from "../controller/postController";
import { userAuth } from "../middleware/auth";

const router = Router();

router.post("/userpost", userAuth, createPost);
router.get("/feed", userAuth, userFeed);

export default router;
