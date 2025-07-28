const express = require("express");
const bodyParser = require("body-parser");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Ensure 'videos' folder exists
const videosDir = path.join(__dirname, "videos");
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir);
}

// Serve videos statically
app.use("/videos", express.static(videosDir));

app.post("/generate-video", (req, res) => {
  const { background, Text } = req.body;

  if (!background || !Text) {
    return res.status(400).json({ error: "background and Text are required" });
  }

  const id = uuidv4();
  const outputFile = path.join(videosDir, `output_${id}.mp4`);

  const safeText = Text.replace(/[:'"]/g, "");

  ffmpeg()
    .input(`color=${background}:s=720x1280:d=5`)
    .inputFormat("lavfi")
    .videoCodec("libx264")
    .outputOptions([
      "-pix_fmt yuv420p",
      `-vf drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${safeText}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2`
    ])
    .duration(5)
    .output(outputFile)
    .on("end", () => {
      const host = req.protocol + "://" + req.get("host");
      res.json({
        video_url: `${host}/videos/output_${id}.mp4`
      });
    })
    .on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).json({ error: "Video generation failed", details: err.message });
    })
    .run();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
