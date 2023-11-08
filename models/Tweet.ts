import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    media: { type: String },
  },
  { timestamps: true }
);

const tweetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    media: [String],
    hastags: [String],
    location: String,
    likes: [mongoose.Schema.Types.ObjectId],
    comments: [commentSchema],
    retweets: [String],
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", tweetSchema);
