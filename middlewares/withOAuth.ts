import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "./withAuth.js";
import { UserType } from "../controllers/userController.js";
import fetch from "node-fetch";
import axios from "axios";

export async function withOAuth(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  let token: string = "";

  if (!req.headers["authorization"])
    return res.status(401).json({
      success: false,
      error: "Unauthenticated, no oAuth token.",
    });

  token = req.headers["authorization"].split(" ")[1];

  if (!token)
    return res.status(401).json({
      success: false,
      error: "Unauthenticated, no oAuth token.",
    });

  const tokenParts = token.split(".");

  const googleApiUrl =
    tokenParts.length === 3
      ? `${process.env.GOOGLE_TOKEN_INFO_URL}?id_token=${token}`
      : `${process.env.GOOGLE_USER_INFO_URL}?access_token=${token}`;

  try {
    const response = await axios.get(googleApiUrl);
    const { data } = response;
    const user: Partial<UserType> = {
      name: (data as { given_name: string }).given_name,
      email: (data as { email: string }).email,
      avatar: (data as { picture: string }).picture,
    };
    req.user = user;
    next();
  } catch (error) {
    console.log("errrorrr");
    return res.status(401).json({
      success: false,
      error: "Unauthenticated.",
    });
  }

  // if (response.ok) {
  //   const user: Partial<UserType> = {
  //     name: (data as { given_name: string }).given_name,
  //     email: (data as { email: string }).email,
  //     avatar: (data as { picture: string }).picture,
  //   };
  //   req.user = user;
  //   next();
  // } else {
  //   console.log("errrorrr");
  //   return res.status(401).json({
  //     success: false,
  //     error: "Unauthenticated.",
  //   });
  // }
}
