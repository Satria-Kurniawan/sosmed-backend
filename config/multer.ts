import multer from "multer";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, "./public/media"); // Menentukan folder tujuan untuk menyimpan file yang diunggah
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const originalFileName = file.originalname;
    const currentDate = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");
    const filename = `${currentDate}_${originalFileName}`;
    cb(null, filename);
  },
});

const multerConfig = multer({ storage: storage });

export default multerConfig;
