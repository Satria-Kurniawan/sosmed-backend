import { Request, Response } from "express";
import Tweet from "../models/Tweet.js";
import { CustomRequest } from "../middlewares/withAuth.js";

export type TweetType = {
  text: string;
  media: string[];
  hastags: string[];
  location: string;
};

export async function composeTweet(req: CustomRequest, res: Response) {
  const { text, media, hastags, location } = req.body;

  const baseUrl = process.env.HOST;

  const files = req.files?.media?.map((m: Express.Multer.File) => {
    return `${baseUrl}/media/${m.filename}`;
  });

  if (!text && !media && !hastags)
    return res.status(400).json({
      success: false,
      error: "Konten tidak boleh kosong.",
    });

  try {
    const tweet = await Tweet.create({
      text,
      media: files,
      hastags,
      location,
      user: req.user?._id,
    });
    res.status(201).json({
      success: true,
      message: "Berhasil mentweet.",
      data: { tweet },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

export async function getAllTweets(req: Request, res: Response) {
  try {
    const tweets = await Tweet.find()
      .populate({
        path: "user",
        select: "name username avatar",
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: null,
      data: { tweets },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}
