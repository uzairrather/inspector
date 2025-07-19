const cloudinary = require('../utils/cloudinary');

// ✅ Upload image/photo
exports.uploadPhoto = async (req, res) => {
  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ message: "No image provided" });
  }

  try {
    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: 'assets_photos',
      resource_type: 'image', // Explicitly set for photos
    });

    res.json({ url: uploadRes.secure_url });
  } catch (err) {
    console.error("❌ Photo upload failed:", err.message);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

// ✅ Upload voice/audio
exports.uploadVoice = async (req, res) => {
  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ message: "No voice file provided" });
  }

  try {
    const uploadRes = await cloudinary.uploader.upload(base64, {
      folder: 'assets_voice',
      resource_type: 'video', // Works for audio/webm or any blob
    });

    res.json({ url: uploadRes.secure_url });
  } catch (err) {
    console.error("❌ Voice upload failed:", err.message);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};
