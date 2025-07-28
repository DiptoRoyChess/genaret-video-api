const express = require('express');
const ffmpeg = require('fluent-ffmpeg');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🎥 Video Generator API is running!');
});

app.post('/generate', async (req, res) => {
  const text = req.body.text || 'Hello World';
  const outputPath = path.join(__dirname, 'output.mp4');

  try {
    // Delete existing output if exists
    if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

    ffmpeg()
      .input('color=c=black:s=1280x720:d=5') // 5 seconds black video
      .inputFormat('lavfi')
      .videoFilters({
        filter: 'drawtext',
        options: {
          fontfile: '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
          text: text,
          fontcolor: 'white',
          fontsize: 60,
          x: '(w-text_w)/2',
          y: '(h-text_h)/2',
          box: 1,
          boxcolor: 'black@0.5',
          boxborderw: 10
        }
      })
      .outputOptions('-movflags frag_keyframe+empty_moov') // for streamable MP4
      .output(outputPath)
      .on('end', () => {
        res.download(outputPath);
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        res.status(500).json({
          error: 'Video generation failed',
          details: err.message
        });
      })
      .run();
  } catch (err) {
    res.status(500).json({
      error: 'Unexpected error occurred',
      details: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
