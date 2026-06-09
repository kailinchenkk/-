import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for parsing large JSON payloads (since we have base64 images like photos/slideshows)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const CONFIG_PATH = path.join(process.cwd(), "wedding_config.json");

  // API Route - Get configuration
  app.get("/api/wedding-config", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const data = fs.readFileSync(CONFIG_PATH, "utf-8");
        return res.json(JSON.parse(data));
      }
      return res.json({ status: "none" });
    } catch (error) {
      console.error("Error reading config:", error);
      return res.status(500).json({ error: "Failed to read configuration" });
    }
  });

  // API Route - Save configuration
  app.post("/api/wedding-config", (req, res) => {
    try {
      const data = req.body;
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), "utf-8");
      return res.json({ success: true });
    } catch (error) {
      console.error("Error writing config:", error);
      return res.status(500).json({ error: "Failed to save configuration" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
