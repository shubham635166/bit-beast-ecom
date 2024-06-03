const Image = require("../model/imgModel");
const fs = require('fs').promises;
const path = require('path');
const { v4: uuid } = require('uuid');
const sizeOf = require('image-size');
const mime = require('mime-types');
const mongoose = require('mongoose');

exports.imageCreate = async (req, res, next) => {
    const { alt_text } = req.body;

    try {

        if (!req.files || !req.files.file) {
            return res.status(200).json({ status: false, message: "No file uploaded" });
        }

        const file = req.files.file;
        const fileName = file.name;
        const fileExt = path.extname(fileName);
        const uniqueFilename = `${uuid()}${fileExt}`;
        const tempFilePath = path.join(__dirname, `../profile/uploads/${uniqueFilename}`);

        // Save file to temporary path
        await fs.writeFile(tempFilePath, file.data);

        const fileSizeInBytes = (await fs.stat(tempFilePath)).size;
        const fileType = mime.lookup(fileName);
        let fileDetails = null;

        if (fileType && fileType.startsWith("image")) {
            fileDetails = sizeOf(tempFilePath);
        }

        const url = `/profile/uploads/${uniqueFilename}`;

        const profileObject = {
            altText: alt_text,
            name: fileName,
            size: fileSizeInBytes,
            type: fileType,
            url,
            dimension: fileDetails ? {
                width: fileDetails.width,
                height: fileDetails.height
            } : undefined
        };

        const result = await Image.create(profileObject);

        if (result) {
            return res.status(200).json({ status: true, message: "Profile added successfully" });
        } else {
            return res.status(200).json({ status: false, message: "Add profile failed!" });
        }
    } catch (error) {
        console.error("Error adding profile:", error);
        return res.status(200).json({ status: false, message: "Internal server error!" });
    }
};

exports.saveMedia = async (req, res, next) => {
  const { alt_text, profile_id } = req.body;
  try {
      if (!mongoose.isValidObjectId(profile_id)) {
          return res.status(200).json({ status: false, message: "Invalid profile id!" });
      }
      const profile = await Image.findById(profile_id);
      if (!profile) {
          return res.status(200).json({ status: false, message: "profile not found" });
      }
      if (!req.files || !req.files.file) {
          return res.status(200).json({ status: false, message: "File not found" });
      }
      const file = req.files.file;
      const fileName = file.name;
      const fileExt = path.extname(fileName);
      const tempFilePath = path.join(__dirname, `../profile/uploads/${uuid()}${fileExt}`); // Set temporary file path
      // Save the uploaded file to a temporary location
      file.mv(tempFilePath, async (err) => {
          if (err) {
              console.error("Error saving file:", err);
              return res.status(200).json({ status: false, message: "Error saving file" });
          }
          const newFileName = path.basename(tempFilePath); // Get the new file name
          // Update profile details
          profile.altText = alt_text;
          profile.name = fileName;
          profile.url = `/profile/uploads/${newFileName}`;
          profile.type = mime.lookup(fileName);
          profile.size = file.size;
          if (profile.type && profile.type.startsWith("image")) {
              const detail = sizeOf(tempFilePath);
              profile.dimension = {
                  width: detail.width,
                  height: detail.height,
              };
          } else {
              profile.dimension = null;
          }
          profile.updatedAt = new Date()
          await profile.save();
          return res.status(200).json({ status: true, message: "profile updated successfully!" });
      });
  } catch (error) {
      console.error("Error updating profile:", error);
      return res.status(200).json({ status: false, message: "Internal Server Error!" });
  }
};
exports.deleteMedia = async (req, res, next) => {
  const { media_id } = req.body;
  try {
      if (!mongoose.isValidObjectId(media_id)) {
          return res.status(200).json({ status: false, message: "Invalid media id!" });
      }
      const media = await Image.findById(media_id);
      if (!media) {
          return res.status(200).json({ status: false, message: "Media not found" });
      }
      // Remove file from storage path if it exists
      if (media.url) {
          const filePath = path.resolve(__dirname, `../media/uploads/${media.url.split("/").pop()}`);
          if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
          }
      }
      const result = await Image.deleteOne({ _id: media_id });
      if (result.deletedCount > 0) {
          return res.status(200).json({ status: true, message: "Media deleted successfully!" });
      } else {
          return res.status(200).json({ status: false, message: "Media delete failed!" });
      }
  } catch (error) {
      console.error("Error deleting media:", error);
      return res.status(200).json({ status: false, message: "Internal server error!" });
  }
};