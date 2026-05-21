import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- KOBOLD PROXY ENDPOINT ---
  // Kita buat proxy biar aman dari CORS
  app.post("/api/kobold-proxy", async (req, res) => {
    const { url, data, method = 'POST' } = req.body;

    if (!url) {
      return res.status(400).json({ error: "Target URL is required" });
    }

    // BLOCK LOCALHOST/127.0.0.1 TO PREVENT ECONNREFUSED
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return res.status(400).json({ 
        error: "Invalid URL: Cannot connect to localhost inside the cloud environment. Please use your Cloudflare/Trycloudflare URL from Colab." 
      });
    }

    try {
      console.log(`[KoboldProxy] 📥 Incoming request for: ${url}`);
      console.log(`[KoboldProxy] 📦 Data payload size: ${JSON.stringify(data || {}).length} chars`);
      
      const response = await axios({
        method: method,
        url: url,
        data: data,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) PascoAI/1.0'
        },
        timeout: 30000 // 30 detik timeout biar nggak gantung
      });

      res.status(response.status).json(response.data);
    } catch (error: any) {
      console.error("[KoboldProxy] Error:", error.message);
      const status = error.response?.status || 500;
      const errorData = error.response?.data || { error: error.message };
      res.status(status).json(errorData);
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Pasco Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
