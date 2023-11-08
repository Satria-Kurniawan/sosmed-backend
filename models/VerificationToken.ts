import mongoose, { Types } from "mongoose";

const verificationTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  user: {
    type: Types.ObjectId,
    required: true,
    ref: "User",
  },
});

export default mongoose.model("VerificationToken", verificationTokenSchema);
