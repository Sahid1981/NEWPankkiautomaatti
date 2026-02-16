const express = require("express");
const rateLimit = require("express-rate-limit");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const config = require("../config");

const multer = require("multer");
// create local multer instance to ensure .single exists
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "image/png") return cb(new Error("Only PNG images allowed"), false);
    cb(null, true);
  }
});

const router = express.Router();

// rate limit uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});

// resolve upload folders inside project's public folder
const AVATAR_DIR = path.join(__dirname, "..", "public", "uploads", "avatars");
const PRE_DIR = path.join(__dirname, "..", "public", "uploads", "pre");
const PREAVATARS_PATH = path.join(__dirname, "..", "public", "preavatars.json");
const PREAVATARS_ALT = path.join(__dirname, "..", "public", "uploads", "preavatars.json");

if (!fs.existsSync(AVATAR_DIR)){
    fs.mkdirSync(AVATAR_DIR, { recursive: true });
}
if (!fs.existsSync(PRE_DIR)){
    fs.mkdirSync(PRE_DIR, { recursive: true });
}

// fake users (replace with DB later)
const users = {
  "1": { id: 1, avatarUrl: "/uploads/avatars/test.png", avatarType: "uploaded" },
  "2": { id: 2, avatarUrl: null, avatarType: null }
};

function deleteAvatarFile(avatarUrl) {
  if (!avatarUrl) return;
  const filePath = path.join(__dirname, "..", "public", avatarUrl.replace(/^\//, ""));
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return;
    fs.unlink(filePath, (err) => {});
  });
}

function toCdnUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = config.cdnBase || "";
  if (!base) return url;
  return base.replace(/\/$/, "") + url;
}

// Get pre-selected avatars by listing files in public/uploads/pre
router.get("/api/avatars/preselected", (req, res) => {
  let avatarsDataPath = null;
  if (fs.existsSync(PREAVATARS_PATH)) avatarsDataPath = PREAVATARS_PATH;
  else if (fs.existsSync(PREAVATARS_ALT)) avatarsDataPath = PREAVATARS_ALT;

  if (avatarsDataPath) {
    try {
      const data = fs.readFileSync(avatarsDataPath, "utf8");
      console.log("preavatars.json raw:", data);
      const avatars = JSON.parse(data).map(a => ({ ...a, url: toCdnUrl(a.url) }));
      return res.json(avatars);
    } catch (e) {
      console.error("Failed to parse preavatars.json:", e);
      return res.status(500).json({ error: "Invalid preavatars.json" });
    }
  }
  fs.readdir(PRE_DIR, (err, files) => {
    if (err) return res.status(500).json({ error: "Cannot list preselected avatars" });
    const avatars = files.filter(f => /\.(png|jpg|jpeg)$/i.test(f)).map((f, i) => ({ id: `${i + 1}`, url: `/uploads/pre/${f}` }));
    res.json(avatars);
  });
});

/* ---------------- UPLOAD AVATAR ---------------- */
router.post("/api/avatar/upload", uploadLimiter, upload.single("avatar"), async (req, res) => {
  try {
    const { userId } = req.body;
    const user = users[userId];
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!req.file || !req.file.buffer) return res.status(400).json({ error: "No file uploaded" });

    const filename = uuidv4() + ".png";
    const filepath = path.join(AVATAR_DIR, filename);

    await sharp(req.file.buffer)
      .resize(512, 512, { fit: "cover" })
      .png({ compressionLevel: 9, adaptiveFiltering: true, force: true })
      .toFile(filepath);


    user.avatarUrl = `/uploads/avatars/${filename}`;
    user.avatarType = "uploaded";

    res.json({ success: true, avatar: user.avatarUrl });
  } catch (err) {
    res.status(400).json({ error: "Invalid image file" });
  }
});

// Choose a pre-selected avatar
router.post("/api/avatar/select/preselected", (req, res) => {
  const { userId, avatarId } = req.body;
  const user = users[userId];
  if (!user) return res.status(404).json({ error: "User not found" });

  if (fs.existsSync(PREAVATARS_PATH)) {
    let avatarsSelectPath = null;
    if (fs.existsSync(PREAVATARS_PATH)) avatarsSelectPath = PREAVATARS_PATH;
    else if (fs.existsSync(PREAVATARS_ALT)) avatarsSelectPath = PREAVATARS_ALT;

    if (avatarsSelectPath) {
      try {
        const data = fs.readFileSync(avatarsSelectPath, "utf8");
        console.log("preavatars.json raw (select):", data);
        const avatars = JSON.parse(data).map(a => ({ ...a, url: toCdnUrl(a.url) }));
        const avatar = avatars.find(a => `${a.id}` === `${avatarId}`);
        if (!avatar) return res.status(404).json({ error: "Avatar not found" });
        if (user.avatarType === "uploaded") deleteAvatarFile(user.avatarUrl);
        user.avatarUrl = avatar.url;
        user.avatarType = "preselected";
        return res.json({ success: true, avatar: user.avatarUrl });
      } catch (e) {
        console.error("Failed to parse preavatars.json (select):", e);
        return res.status(500).json({ error: "Invalid preavatars.json" });
      }
    }
  }

  // map avatarId to file in PRE_DIR
  const files = fs.readdirSync(PRE_DIR).filter(f => /\.(png|jpg|jpeg)$/i.test(f));
  const idx = parseInt(avatarId, 10) - 1;
  if (!files[idx]) return res.status(404).json({ error: "Avatar not found" });

  // delete previous uploaded avatar if any
  if (user.avatarType === "uploaded") deleteAvatarFile(user.avatarUrl);

  user.avatarUrl = `/uploads/pre/${files[idx]}`;
  user.avatarType = "preselected";

  res.json({ success: true, avatar: user.avatarUrl });
});

module.exports = router;

