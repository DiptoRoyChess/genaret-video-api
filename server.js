const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(express.json());

app.post("/generate", (req, res) => {
  const { text } = req.body;
  const input = path.join(__dirname, "input.mp4"); // ensure you have this file
  const output = path.join(__dirname, "output.mp4");

  const drawtextFilter = `drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:text='${text}':fontcolor=white:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2`;

  const command = `ffmpeg -i "${input}" -vf "${drawtextFilter}" -codec:a copy "${output}" -y`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({
        error: "Video generation failed",
        details: stderr.toString(),
      });
    }

    const video = fs.readFileSync(output);
    res.setHeader("Content-Type", "video/mp4");
    res.send(video);
  });
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
