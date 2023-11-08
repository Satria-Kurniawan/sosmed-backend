import { Request, Response } from "express";
import mongoose, { Error } from "mongoose";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import VerificationToken from "../models/VerificationToken.js";
import {
  generateAccessToken,
  generateVerificationToken,
} from "../utils/generateToken.js";
import { generateUsername } from "../utils/generateUsername.js";
import { generateExpiryDate } from "../utils/generateExpiryDate.js";
import { CustomRequest } from "../middlewares/withAuth.js";

export type UserType = {
  _id: mongoose.Schema.Types.ObjectId;
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
  avatar: string;
  verified: boolean;
  followers: string[];
  followings: string[];
  accountActive: boolean;
};

type VerificationTokenType = {
  token: string;
  expiresAt: Date;
  user: UserType;
};

export async function signUp(req: Request<{}, {}, UserType>, res: Response) {
  const { name, email, phone, avatar, password, passwordConfirmation } =
    req.body;

  if (!passwordConfirmation) {
    return res.status(400).json({
      success: false,
      error: "Kolom Konfirmasi password (passwordConfirmation) wajib diisi.",
    });
  }

  if (password !== passwordConfirmation) {
    return res.status(400).json({
      success: false,
      error: "Konfirmasi password tidak sesuai.",
    });
  }

  if (!email && !phone) {
    return res.status(400).json({
      success: false,
      error: "Email/Phone wajib diisi.",
    });
  }

  try {
    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    if (emailExists) {
      if (emailExists.accountActive) {
        return res.status(400).json({
          success: false,
          error: "Email telah digunakan.",
        });
      } else {
        const verificationToken = await VerificationToken.findOne({
          user: emailExists._id,
        });
        return res.status(302).json({
          success: true,
          message: "Redirect",
          data: { accountActive: false, verificationToken },
        });
      }
    }

    if (phoneExists)
      return res.status(400).json({
        success: false,
        error: "Nomor telepon telah digunakan.",
      });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      username: generateUsername(name),
      email,
      phone,
      avatar,
      password: hashedPassword,
      accountActive: email !== "" ? false : true,
    });

    if (phone && user) {
      return res.status(201).json({
        success: true,
        message: "Berhasil registrasi akun.",
      });
    }

    const verificationToken = await generateVerificationToken(10);
    const expiryDate = generateExpiryDate(12, "hours");

    await VerificationToken.create({
      token: verificationToken,
      expiresAt: expiryDate,
      user: user._id,
    });

    const verificationLink = `${process.env.FRONTEND_URL}/accounts/verify?email=${user.email}&token=${verificationToken}`;

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to: email,
      subject: "Verifikasi Email",
      text: `Klik tautan berikut untuk verifikasi email Anda: ${verificationLink}`,
      html: `
        <h1>Verifikasi akun Vibegram</h1>
        <div>Klik <a href="${verificationLink}">LINK</a> berikut untuk mengaktifkan akun Vibegram Anda.</div>
      `,
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          ok: false,
          message: "Gagal mengirim link verifikasi email.",
        });
      }
    });

    res.status(201).json({
      success: true,
      message: "Lakukan verifikasi akun melalui email.",
      data: { verificationToken },
    });
  } catch (error) {
    if (error instanceof Error.ValidationError) {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages,
      });
    }
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

export async function verifyEmail(req: Request, res: Response) {
  const { token } = req.query;

  try {
    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken)
      return res.status(404).json({
        success: false,
        error: "Invalid token.",
      });

    const currentDate = new Date();
    const tokenExpired = verificationToken.expiresAt < currentDate;

    if (tokenExpired) {
      await VerificationToken.findByIdAndDelete(verificationToken._id);
      await User.findByIdAndDelete(verificationToken.user);

      return res.status(400).json({
        success: false,
        error: "Token kadaluarsa, silahkan mendaftar ulang.",
      });
    }

    await User.findByIdAndUpdate(verificationToken.user, {
      accountActive: true,
    });
    await VerificationToken.findByIdAndDelete(verificationToken._id);

    res.status(200).json({
      success: true,
      message: "Selamat akun anda telah aktif. Silahkan melakukan login.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function signIn(req: Request<{}, {}, UserType>, res: Response) {
  const { email, phone, password } = req.body;

  if (!password || (!email && !phone)) {
    return res.status(400).json({
      success: false,
      error: "Mohon lengkapi kolom yang diberikan.",
    });
  }

  try {
    let user;

    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }

    if (!user)
      return res.status(404).json({
        success: false,
        error: `Pengguna tidak ditemukan.`,
      });

    if (!user.accountActive)
      return res.status(404).json({
        success: false,
        error: `Akun anda belum aktif, cek email untuk mengaktifkan akun.`,
      });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(404).json({
        success: false,
        error: `Password yang anda masukan salah.`,
      });

    const accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      message: "Berhasil login.",
      data: { user, accessToken },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getVerificationTokenData(req: Request, res: Response) {
  const { token } = req.query;

  try {
    const data: VerificationTokenType | null = await VerificationToken.findOne({
      token,
    }).populate("user");

    if (!data)
      return res.status(400).json({
        success: false,
        error: "Invalid token.",
      });

    const verificationToken: VerificationTokenType = {
      token: data.token,
      expiresAt: data.expiresAt,
      user: data.user,
    };

    res.status(200).json({
      success: true,
      data: { verificationToken },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getUserByEmail(req: Request, res: Response) {
  const { email } = req.query;

  if (!email)
    return res.status(400).json({
      success: false,
      error: "No email.",
    });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({
        success: false,
        error: "User not found.",
      });

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}

export async function getMe(req: CustomRequest, res: Response) {
  const user = req.user;
  res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function signInWithGoogle(req: CustomRequest, res: Response) {
  let user;
  let accessToken: string = "";

  try {
    const userFound = await User.findOne({ email: req.user?.email });
    if (userFound) {
      if (userFound.avatar === null) {
        userFound.avatar = req.user?.avatar;
        userFound.save();
      }

      user = userFound;
      accessToken = generateAccessToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Berhasil login.",
        data: { user, accessToken },
      });
    }

    const newUser = await User.create({
      name: req.user?.name,
      email: req.user?.email,
      username: req.user?.name ? generateUsername(req.user?.name) : "",
      avatar: req.user?.avatar,
      accountActive: true,
    });

    user = newUser;
    accessToken = generateAccessToken(user._id);

    res.status(200).json({
      success: true,
      message: "Berhasil login.",
      data: { user, accessToken },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
