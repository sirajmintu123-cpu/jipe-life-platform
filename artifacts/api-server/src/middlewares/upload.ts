import multer from "multer";
import path from "path";
import fs from "fs";

const ALLOWED_FOLDERS = [
  "users",
  "kyc",
  "products",
  "rewards",
  "news",
  "banners",
  "gallery",
  "company",
  "temp",
];

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder =
      typeof req.query.folder === "string" &&
      ALLOWED_FOLDERS.includes(req.query.folder)
        ? req.query.folder
        : "temp";

    const uploadPath = path.join(process.cwd(), "uploads", folder);

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);

    const filename =
      Date.now() +
      "-" +
      Math.random().toString(36).substring(2, 10) +
      ext;

    cb(null, filename);
  },
});

function fileFilter(
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }

  cb(null, true);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});