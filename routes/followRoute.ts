import express, { Router } from "express";
import { followUser, get_follows_followers } from "../controller/followController";
import { userAuth } from "../middleware/auth";

const router: Router = express.Router();

router.post("/followuser", userAuth, followUser);
router.get("/followersdata", userAuth, get_follows_followers);

export default router;
