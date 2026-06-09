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

  // API Route - Serve binary wedding thumbnail for social sharing crawlers (to support base64 images on platforms like LINE/FB)
  app.get("/api/wedding-thumbnail.jpg", (req, res) => {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const configData = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        const heroImages = configData.heroImages;
        if (Array.isArray(heroImages) && heroImages.length > 0 && heroImages[0]) {
          const firstImage = heroImages[0];
          
          if (firstImage.startsWith("data:")) {
            // Extract content type and base64 string
            const matches = firstImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
              const contentType = matches[1];
              const base64Data = matches[2];
              const imgBuffer = Buffer.from(base64Data, "base64");
              
              res.setHeader("Content-Type", contentType);
              res.setHeader("Cache-Control", "public, max-age=86400"); // cache for 1 day
              return res.send(imgBuffer);
            }
          } else {
            // If it's a normal URL, fetch/redirect or proxy
            return res.redirect(firstImage);
          }
        }
      }
      
      // Fallback: If no config image, serve empty or 404
      return res.status(404).send("Thumbnail not found");
    } catch (error) {
      console.error("Error serving wedding thumbnail:", error);
      return res.status(500).send("Internal Server Error");
    }
  });

  function injectMetaTags(html: string, req: express.Request): string {
    try {
      if (fs.existsSync(CONFIG_PATH)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
        
        const groom = config.groomName || "長升";
        const bride = config.brideName || "凱琳";
        const date = config.dateStr || "2026年9月12日";
        const location = config.locationName || "唯愛庭園";
        
        const title = `${groom} ＆ ${bride} 婚禮邀請`;
        const description = `${groom} ＆ ${bride} 要結婚啦！婚期定於 ${date} 在 ${location} 舉行，誠摯邀請您一同共襄盛舉，分享我們的幸福喜悅。`;
        
        // Dynamically build the absolute URL for the thumbnail image
        const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
        const host = req.headers.host;
        const ogImage = `${protocol}://${host}/api/wedding-thumbnail.jpg`;
        
        let modifiedHtml = html;
        
        // Replace Title tag
        modifiedHtml = modifiedHtml.replace(/<title>[^<]*<\/title>/g, `<title>${title}</title>`);
        
        // Replace og:title
        modifiedHtml = modifiedHtml.replace(
          /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?\s*>/g,
          `<meta property="og:title" content="${title}" />`
        );
        
        // Replace og:description
        modifiedHtml = modifiedHtml.replace(
          /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?\s*>/g,
          `<meta property="og:description" content="${description}" />`
        );
        
        // Replace description
        modifiedHtml = modifiedHtml.replace(
          /<meta\s+name="description"\s+content="[^"]*"\s*\/?\s*>/g,
          `<meta name="description" content="${description}" />`
        );
        
        // Replace og:image
        modifiedHtml = modifiedHtml.replace(
          /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?\s*>/g,
          `<meta property="og:image" content="${ogImage}" />`
        );
        
        return modifiedHtml;
      }
    } catch (e) {
      console.error("Failed to inject dynamic meta tags:", e);
    }
    return html;
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Intercept client-side requests on GET / or /index.html and dynamically inject meta headers
    app.use(async (req, res, next) => {
      if (req.method === "GET" && (req.path === "/" || req.path === "/index.html")) {
        try {
          const rawHtml = fs.readFileSync(path.join(process.cwd(), "index.html"), "utf-8");
          let transformedHtml = await vite.transformIndexHtml(req.originalUrl, rawHtml);
          transformedHtml = injectMetaTags(transformedHtml, req);
          res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
          return;
        } catch (e) {
          next(e);
          return;
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    
    app.get("/", (req, res) => {
      try {
        const rawHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
        const transformedHtml = injectMetaTags(rawHtml, req);
        res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
      } catch (e) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });

    app.get("/index.html", (req, res) => {
      try {
        const rawHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
        const transformedHtml = injectMetaTags(rawHtml, req);
        res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
      } catch (e) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });

    app.use(express.static(distPath));

    app.get("*", (req, res) => {
      try {
        const rawHtml = fs.readFileSync(path.join(distPath, "index.html"), "utf-8");
        const transformedHtml = injectMetaTags(rawHtml, req);
        res.status(200).set({ "Content-Type": "text/html" }).end(transformedHtml);
      } catch (e) {
        res.sendFile(path.join(distPath, "index.html"));
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
