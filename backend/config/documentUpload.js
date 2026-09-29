const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

/*
 * Local disk storage for Phase 8 development.
 *
 * This is deliberately isolated here so that swapping
 * to object storage later (S3 / Cloudinary) means
 * changing this file and the storagePath handling,
 * not the document model or the RAG pipeline.
 *
 * NOTE: on a host with an ephemeral filesystem
 * (e.g. Render), files stored here do not survive a
 * restart or redeploy.
 */
const uploadDir = path.join(
  __dirname,
  "../uploads/documents"
);

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    /*
     * The stored name is generated, never derived from
     * the uploaded name. This prevents path traversal
     * via a crafted originalname such as "../../x.pdf".
     */
    const uniqueName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    cb(null, uniqueName);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.has(file.mimetype)) {
    const error = new Error(
      "Only PDF, DOCX and TXT files are supported."
    );

    error.code = "INVALID_FILE_TYPE";

    return cb(error);
  }

  return cb(null, true);
};

const documentUpload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

documentUpload.uploadDir = uploadDir;
documentUpload.allowedMimeTypes = allowedMimeTypes;

module.exports = documentUpload;