import express from 'express';
import cors from 'cors';
import ytdl from '@distube/ytdl-core';

const app = express();
const PORT = process.env.PORT || 8000;

// Explicit CORS to mirror the FastAPI config (allow everything)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: '*',
    credentials: false,
  }),
);

// Helper to sanitize filenames for Content-Disposition header
function sanitizeFilename(name: string, ext = 'mp4') {
  const base =
    name
      .replace(/[\n\r]/g, ' ')
      .replace(/[^\w\d\-_.()\s]/g, '_')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 150) || 'video';
  return `${base}.${ext}`;
}

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the YouTube Downloader API!' });
});

app.get('/videoInfo', async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).json({ detail: 'Error: Invalid URL' });
  try {
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ detail: 'Error: Invalid URL' });
    }
    const info = await ytdl.getInfo(url);
    const { videoDetails } = info;
    const data = {
      title: videoDetails.title,
      author: videoDetails.author.name,
      embed: `https://www.youtube.com/embed/${videoDetails.videoId}`,
      thumbnail:
        videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url,
    };
    res.json(data);
  } catch (e: any) {
    res.status(400).json({ detail: 'Error getting video info: ' + e.message });
  }
});

app.get('/download', async (req, res) => {
  const url = req.query.url as string;
  if (!url) return res.status(400).json({ detail: 'Error: Invalid URL' });
  try {
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ detail: 'Error: Invalid URL' });
    }

    const info = await ytdl.getInfo(url);
    const { videoDetails } = info;
    const filename = sanitizeFilename(videoDetails.title, 'mp4');

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'video/mp4');

    // Use combined audio+video stream with highest available quality
    const stream = ytdl.downloadFromInfo(info, {
      quality: 'highest',
      filter: 'audioandvideo',
    });

    stream.on('error', (err) => {
      console.error(err);
      if (!res.headersSent) res.status(400);
      res.end();
    });

    stream.pipe(res);
  } catch (e: any) {
    res.status(400).json({ detail: 'Error downloading video: ' + e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
