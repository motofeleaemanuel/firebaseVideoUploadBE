const { bucket, db } = require("../firebase.js");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const uploadFile = async (req, res) => {
  const file = req.file;
  const { id } = req.user;
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  const generatedId = uuidv4();
  const fileName = `${generatedId}/${file.originalname}`;
  const fileUpload = bucket.file(fileName);

  const expirationTimestamp = Date.now() + 10 * 24 * 60 * 60 * 1000;

  const [url] = await fileUpload.getSignedUrl({
    action: "read",
    expires: expirationTimestamp,
  });

  const blobStream = fileUpload.createWriteStream({
    metadata: {
      contentType: file.mimetype,
    },
  });

  blobStream.on("error", () => {
    return res.status(500).send("Error uploading file.");
  });

  blobStream.on("finish", async () => {
    try {
      const cloudflareApiUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_IDENTIFIER}/stream/copy`;
      const cloudflareApiKey = process.env.CLOUDFLARE_API_KEY;
      const cloudflareApiResponse = await axios.post(
        cloudflareApiUrl,
        {
          url: url,
          meta: { name: generatedId },
        },
        {
          headers: {
            Authorization: `Bearer ${cloudflareApiKey}`,
          },
        }
      );
      db.collection("Files").doc(generatedId).set({
        fileName: file.originalname,
        firestoreVideoUrl: url,
        cloudflarePlaybackUrl: cloudflareApiResponse.data.result.preview,
        userId: id,
      });
      res.status(200).send("File uploaded successfully");
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading file");
    }
  });

  blobStream.end(file.buffer);
};

const getAllFileNames = async (req, res) => {
  try {
    const filesSnapshot = await db.collection("Files").get();

    const files = [];
    filesSnapshot.forEach((doc) => {
      const fileData = doc.data();
      files.push({
        id: doc.id,
        fileName: fileData.fileName,
        firestoreVideoUrl: fileData.firestoreVideoUrl,
        cloudflarePlaybackUrl: fileData.cloudflarePlaybackUrl,
        userId: fileData.userId,
      });
    });

    res.status(200).send(files);
  } catch (err) {
    console.log(err);
    return res.status(500).send(err);
  }
};

const downloadFileByName = async (req, res) => {
  try {
    const { fileId, fileName } = req.query;
    if (!fileId || !fileName) {
      return res.status(400).send({
        message: "Missing fileId or fileName in the query parameters.",
      });
    }

    const file = bucket.file(`${fileId}/${fileName}`);
    const fileStream = file.createReadStream();

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    fileStream.pipe(res);
  } catch (error) {
    res.status(500).send({ message: "Error downloading file." });
  }
};

const deleteFileByName = async (req, res) => {
  try {
    const { fileId, fileName } = req.query;
    if (!fileName || !fileId) {
      return res
        .status(400)
        .send({ error: "Missing fileName or fileId in the query parameters." });
    }
    const file = bucket.file(`${fileId}/${fileName}`);
    const fileDocRef = db.collection("Files").doc(fileId);

    const fileSnapshot = await fileDocRef.get();
    if (!fileSnapshot.exists) {
      return res.status(404).json({ error: "File not found" });
    }

    const exists = await file.exists();
    if (!exists[0]) {
      return res.status(400).send({ message: "File not found" });
    }
    await fileDocRef.delete();
    await file.delete();
    return res.status(200).send({ message: "File deleted successfully" });
  } catch (error) {
    return res.status(500).send({ message: "Error deleting the file." });
  }
};

module.exports = {
  uploadFile,
  getAllFileNames,
  downloadFileByName,
  deleteFileByName,
};
