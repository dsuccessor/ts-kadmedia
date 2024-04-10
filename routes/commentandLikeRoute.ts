import express from "express";
import {
  commentOnPost,
  likePost,
  commentPerPost,
  likePerPost,
  likeComment
} from "../controller/comentAndLikeController";
import { userAuth } from "../middleware/auth";

const router = express.Router();

router.post("/commentonpost", userAuth, commentOnPost);
router.post("/likepost", userAuth, likePost);
router.post("/likecomment", userAuth, likeComment);
router.get("/commentperpost", userAuth, commentPerPost);
router.get("/likeperpost", userAuth, likePerPost);

export default router;
