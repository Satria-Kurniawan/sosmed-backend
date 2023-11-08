import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      unique: true,
    },
    avatar: {
      type: String,
      required: false,
      default: null,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    followers: {
      type: Array,
      default: [],
    },
    followings: {
      type: Array,
      default: [],
    },
    accountActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
