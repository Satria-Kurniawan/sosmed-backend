import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

export default async function connectToDatabase() {
  try {
    const db = await mongoose.connect(uri as string);
    console.log("Terhubung ke MongoDB", db.connection.host);
  } catch (error) {
    console.error("Gagal terhubung ke MongoDB:", error);
  }
}
