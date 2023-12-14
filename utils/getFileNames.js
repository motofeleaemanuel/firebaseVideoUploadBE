const { bucket } = require("../firebase.js");

const listFileNamesWithSize = async () => {
  try {
    const [files] = await bucket.getFiles("videos/");
    const fileInfo = await Promise.all(
      files.map(async (file) => {
        const [metadata] = await file.getMetadata();
        return {
          name: file.name.split("/")[1],
          size: metadata.size,
        };
      })
    );
    return fileInfo;
  } catch (error) {
    console.error("Error listing file information:", error);
    throw error;
  }
};

module.exports = { listFileNamesWithSize };
