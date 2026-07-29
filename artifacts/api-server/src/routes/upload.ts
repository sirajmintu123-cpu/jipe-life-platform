import { Router } from "express";
import { upload } from "../middleware/upload";
import { requireAuth } from "../lib/auth";

const router = Router();

router.post(
  "/upload",
  requireAuth,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: "No file uploaded",
      });
    }

    const folder =
      typeof req.query.folder === "string"
        ? req.query.folder
        : "temp";

    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/${folder}/${req.file.filename}`,
    });
  }
);

export default router;