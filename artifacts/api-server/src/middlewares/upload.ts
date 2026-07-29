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

    cb(
      null,
      `${Date.now()}-${Math.random().toString(36).substring(2, 10)}${ext}`
    );
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (!allowed.includes(file.mimetype)) {
    cb(new Error("Unsupported file type"));
    return;
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});