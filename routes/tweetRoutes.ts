import express from "express";
import { composeTweet, getAllTweets } from "../controllers/tweetTontroller.js";
import { withAuth } from "../middlewares/withAuth.js";
import { multipleMedia } from "../middlewares/uploadMedia.js";

const router = express.Router();

router.post("/compose", [withAuth, multipleMedia], composeTweet);
router.get("/all", getAllTweets);

const tweetRouter = router;

export default tweetRouter;
