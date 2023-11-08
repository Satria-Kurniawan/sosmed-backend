import express, { Router } from "express";
import {
  verifyEmail,
  signIn,
  signUp,
  getVerificationTokenData,
  getUserByEmail,
  getMe,
  signInWithGoogle,
} from "../controllers/userController.js";
import { withAuth } from "../middlewares/withAuth.js";
import { withOAuth } from "../middlewares/withOAuth.js";

const router: Router = express.Router();

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.get("/verify-email", verifyEmail);
router.get("/verification-token", getVerificationTokenData);
router.get("/by-email", getUserByEmail);
router.get("/me", withAuth, getMe);
router.post("/google-sign-in", withOAuth, signInWithGoogle);

const userRouter = router;
export default userRouter;
