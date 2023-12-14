const express = require("express");
const multer = require("multer");
const {
  getAllFileNames,
  uploadFile,
  downloadFileByName,
  deleteFileByName,
} = require("../controllers/storageController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/", authMiddleware, upload.single("file"), uploadFile);
router.get("/", authMiddleware, getAllFileNames);
router.get("/download", authMiddleware, downloadFileByName);
router.delete("/", authMiddleware, deleteFileByName);

module.exports = router;
