import { Request, Response, NextFunction } from "express";
import { UserType } from "../controllers/userController.js";
import { TweetType } from "../controllers/tweetTontroller.js";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export type CustomRequest = Request<{}, {}, TweetType> & {
  user?: Partial<UserType>;
  files?: { media?: Express.Multer.File[] };
};

export async function withAuth(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  let token: string = "";

  if (!req.headers["authorization"])
    return res.status(401).json({
      success: false,
      error: "Unauthenticated, no token.",
    });

  token = req.headers["authorization"].split(" ")[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, error: "Unauthorized, no token." });

  try {
    const secretKey = process.env.JWT_SECRET;
    const decodedToken = secretKey && jwt.verify(token, secretKey);

    if (decodedToken && typeof decodedToken !== "string") {
      const user = await User.findById(decodedToken.userId);
      req.user = user as unknown as Partial<UserType>;
      next();
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      error: "Unauthorized",
    });
  }
}
