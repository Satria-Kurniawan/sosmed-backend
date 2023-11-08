import jwt, { Secret } from "jsonwebtoken";
import { Types } from "mongoose";
import crypto from "crypto";

export function generateAccessToken(userId: Types.ObjectId) {
  const secretKey = process.env.JWT_SECRET;
  const token = jwt.sign({ userId }, secretKey as Secret, { expiresIn: "1d" });
  return token;
}

export function generateVerificationToken(length: number) {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(length, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        const token = buffer.toString("hex");
        resolve(token);
      }
    });
  });
}
