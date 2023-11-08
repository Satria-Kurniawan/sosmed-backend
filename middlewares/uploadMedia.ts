import multerConfig from "../config/multer.js";

const singleMedia = multerConfig.single("media");
const multipleMedia = multerConfig.fields([{ name: "media", maxCount: 4 }]);

export { singleMedia, multipleMedia };
