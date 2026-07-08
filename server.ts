import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Express App
const app = express();
app.use(express.json());
const PORT = 3000;

// Path to products database
const productsFilePath = path.join(process.cwd(), "src", "data", "products.json");

// Lazy load Gemini AI Client to prevent startup crash if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Memory click tracking store as fallback or synchronization
// We will seed this memory with realistic click counts that correspond to products.json
let inMemoryClicks: Record<string, number> = {};
let inMemoryConversions: Record<string, number> = {};
let analyticsLogs: Array<{ id: string; text: string; badge: string; time: string; timestamp: number }> = [
  { id: "log-1", text: "Operator synchronized affiliate redirect links", badge: "SYNC", time: "Just now", timestamp: Date.now() - 50000 },
  { id: "log-2", text: "Phantom Volt '24 click traffic routed to Shopee", badge: "SYNC", time: "10 mins ago", timestamp: Date.now() - 600000 },
  { id: "log-3", text: "Eiger Apex 25L Tactical Pack click traffic routed to TikTok Shop", badge: "SYNC", time: "25 mins ago", timestamp: Date.now() - 1500000 },
];

function seedMemoryStore() {
  try {
    if (fs.existsSync(productsFilePath)) {
      const data = fs.readFileSync(productsFilePath, "utf-8");
      const products = JSON.parse(data);
      products.forEach((p: any, idx: number) => {
        const baseClicks = 42;
        const indexModifier = (idx * 19) % 87;
        const statusModifier = p.status === "Draft" ? 0 : 35;
        inMemoryClicks[p.id] = baseClicks + indexModifier + statusModifier;
        
        // Let's also seed conversions (approx 5% - 15% of clicks)
        inMemoryConversions[p.id] = Math.max(1, Math.round(inMemoryClicks[p.id] * 0.08));
      });
    }
  } catch (err) {
    console.error("Failed to seed in-memory click stats from products.json", err);
  }
}
seedMemoryStore();

// --- API ROUTES ---

// 1. GET /api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", fullstack: true, timestamp: Date.now() });
});

// 2. GET /api/analytics
app.get("/api/analytics", (req, res) => {
  try {
    let products: any[] = [];
    if (fs.existsSync(productsFilePath)) {
      products = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
    }

    // Populate missing keys
    products.forEach((p) => {
      if (!inMemoryClicks[p.id]) {
        inMemoryClicks[p.id] = 12;
      }
      if (!inMemoryConversions[p.id]) {
        inMemoryConversions[p.id] = 1;
      }
    });

    // Compute aggregates
    const totalTrackedLinks = products.length;
    const activeLinksCount = products.filter((p) => p.affiliateUrl && p.affiliateUrl.trim() !== "").length;
    const totalClicksCount = Object.values(inMemoryClicks).reduce((acc, curr) => acc + curr, 0);
    const totalConversions = Object.values(inMemoryConversions).reduce((acc, curr) => acc + curr, 0);
    
    // Average CTR calculation
    const avgClicksPerProduct = totalTrackedLinks > 0 ? (totalClicksCount / totalTrackedLinks).toFixed(1) : "0.0";

    // Platform distributions
    const platformCounts: Record<string, number> = { Shopee: 0, Tokopedia: 0, "TikTok Shop": 0, Lazada: 0 };
    const platformClicks: Record<string, number> = { Shopee: 0, Tokopedia: 0, "TikTok Shop": 0, Lazada: 0 };
    const platformRevenue: Record<string, number> = { Shopee: 0, Tokopedia: 0, "TikTok Shop": 0, Lazada: 0 };

    products.forEach((p) => {
      const marketplace = p.marketplace || "Shopee";
      platformCounts[marketplace] = (platformCounts[marketplace] || 0) + 1;
      
      const clicks = inMemoryClicks[p.id] || 0;
      platformClicks[marketplace] = (platformClicks[marketplace] || 0) + clicks;

      // Commission estimated as 5% of sale price per conversion
      const conversions = inMemoryConversions[p.id] || 0;
      const commissionEst = (p.salePrice * 0.05 * conversions);
      platformRevenue[marketplace] = (platformRevenue[marketplace] || 0) + commissionEst;
    });

    const platformShare = Object.keys(platformCounts).map((platform) => {
      const c = platformClicks[platform] || 0;
      const percentage = totalClicksCount > 0 ? Math.round((c / totalClicksCount) * 100) : 0;
      const count = platformCounts[platform] || 0;
      const revenue = platformRevenue[platform] || 0;
      return {
        platform,
        count,
        clicks: c,
        percentage,
        revenue
      };
    });

    // Top Performing Products
    const topPerforming = products.map((p) => {
      const clicks = inMemoryClicks[p.id] || 0;
      const conversions = inMemoryConversions[p.id] || 0;
      const commission = p.salePrice * 0.05 * conversions;
      return {
        id: p.id,
        name: p.name,
        brand: p.brand,
        image: p.image,
        marketplace: p.marketplace,
        clicks,
        conversions,
        commission
      };
    }).sort((a, b) => b.clicks - a.clicks).slice(0, 4);

    res.json({
      summary: {
        totalTrackedLinks,
        activeLinksCount,
        totalClicksCount,
        totalConversions,
        avgClicksPerProduct,
        estimatedTotalCommissions: Object.values(platformRevenue).reduce((a, b) => a + b, 0),
      },
      platformShare,
      topPerforming,
      recentLogs: analyticsLogs.slice(0, 15)
    });
  } catch (err) {
    console.error("Failed to generate analytics report", err);
    res.status(500).json({ error: "Failed to load server analytics panel metrics" });
  }
});

// 3. POST /api/analytics/click
app.post("/api/analytics/click", (req, res) => {
  const { productId, productName, platform } = req.body;
  if (!productId) {
    return res.status(400).json({ error: "productId is required" });
  }

  // Increment click count
  inMemoryClicks[productId] = (inMemoryClicks[productId] || 0) + 1;

  // 8% chance to trigger a mock conversion on this click
  let conversionRegistered = false;
  if (Math.random() < 0.1) {
    inMemoryConversions[productId] = (inMemoryConversions[productId] || 0) + 1;
    conversionRegistered = true;
  }

  // Log to audit trace
  const platformLabel = platform || "Marketplace";
  const labelText = productName ? `"${productName}"` : `Product ID [${productId}]`;
  const logMessage = `Visitor tracking click registered for ${labelText} outbound to ${platformLabel}`;
  
  const newLog = {
    id: `log-${Math.random().toString(36).substring(2, 9)}`,
    text: logMessage,
    badge: "SYNC" as const,
    time: "Just now",
    timestamp: Date.now()
  };

  analyticsLogs.unshift(newLog);
  if (analyticsLogs.length > 50) {
    analyticsLogs = analyticsLogs.slice(0, 50);
  }

  if (conversionRegistered) {
    const conversionLog = {
      id: `log-${Math.random().toString(36).substring(2, 9)}`,
      text: `Affiliate conversion credited: 1 order matched for ${labelText} (${platformLabel})`,
      badge: "SYNC" as const,
      time: "Just now",
      timestamp: Date.now()
    };
    analyticsLogs.unshift(conversionLog);
  }

  res.json({
    success: true,
    clicks: inMemoryClicks[productId],
    conversions: inMemoryConversions[productId],
    conversionRegistered
  });
});

// 4. POST /api/specimen-matcher
app.post("/api/specimen-matcher", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    let productsList: any[] = [];
    if (fs.existsSync(productsFilePath)) {
      productsList = JSON.parse(fs.readFileSync(productsFilePath, "utf-8"));
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Graceful local fallback when Gemini API key is not configured
      console.log("GEMINI_API_KEY is not defined. Falling back to local semantic heuristic search.");
      
      const searchTerms = prompt.toLowerCase().split(/\s+/);
      const scoredProducts = productsList.map((p) => {
        let score = 0;
        const textToMatch = `${p.name} ${p.description} ${p.brand} ${p.category} ${p.highlights.join(" ")}`.toLowerCase();
        
        searchTerms.forEach((term) => {
          if (term.length < 3) return;
          if (textToMatch.includes(term)) {
            score += 10;
          }
          // Exact matches get extra score
          if (p.name.toLowerCase().includes(term)) score += 15;
          if (p.brand.toLowerCase().includes(term)) score += 12;
          if (p.category.toLowerCase().includes(term)) score += 12;
        });

        return { product: p, score };
      });

      // Sort by score
      const matches = scoredProducts
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

      // If no keyword match, just pick top 2 products as best options
      const finalMatches = matches.length > 0 ? matches : [
        { product: productsList[0], score: 20 },
        { product: productsList[1], score: 15 }
      ];

      const fallbackResponse = {
        matches: finalMatches.map((m, idx) => {
          const confidence = Math.min(95, 75 + m.score + (idx === 0 ? 5 : -5));
          return {
            id: m.product.id,
            name: m.product.name,
            slug: m.product.slug,
            brand: m.product.brand,
            image: m.product.image,
            salePrice: m.product.salePrice,
            marketplace: m.product.marketplace,
            affiliateUrl: m.product.affiliateUrl,
            confidenceScore: confidence,
            matchReason: `Matched terms for physical profiles. Highly relevant to "${prompt}" because of its premium ${m.product.brand} craftsmanship, ${m.product.highlights[0].toLowerCase()}, and comfortable design.`,
            stylingAdvice: `Pair these ${m.product.brand} kicks with relaxed cargo trousers, an oversized hoodie, and a modern technical backpack for a complete, futuristic street look.`,
            matchBadges: ["Premium Fit", "Popular Specimen"]
          };
        }),
        analysisSummary: `Local specimen analyzer scanned ${productsList.length} total models. Based on physical parameters, the ${finalMatches[0]?.product.name} presents the optimal technical match. (Note: Running in high-performance Local Fallback mode because Gemini API key is pending configuration).`
      };

      return res.json(fallbackResponse);
    }

    // Build standard prompt with products context for Gemini
    const systemPrompt = `You are the LookVerse AI Specimen Matcher, an elite fashion curation engine.
Your task is to analyze the user's fashion description, style vibe, or physical preference, and recommend the best 2 matching items from the available catalog.

Available Catalog:
${JSON.stringify(productsList.map(p => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  brand: p.brand,
  description: p.description,
  category: p.category,
  salePrice: p.salePrice,
  highlights: p.highlights,
  marketplace: p.marketplace,
  affiliateUrl: p.affiliateUrl,
  image: p.image
})), null, 2)}

Instructions:
1. Compare the user's description with the catalog. Find the top 2 best matches.
2. For each match, provide:
   - confidenceScore: An integer representing how well it fits (0 to 100).
   - matchReason: A detailed, highly customized, professional paragraph explaining why it's a perfect match. Speak using terms like "optimal ergonomics", "subtle color accents", "athletic silhouette", "street aesthetic".
   - stylingAdvice: Expert styling tips (what garments, accessories, or tones to pair it with).
   - matchBadges: 2 custom design-led tags (e.g., "Futuristic Silhouette", "Gorpcore Aesthetic", "Clean Minimalist").
3. Also provide a beautiful 'analysisSummary' summarizing the overall match results and why these recommendations were selected.
4. Return your response strictly in the requested JSON structure. Do not include markdown codeblocks or anything other than the raw JSON itself.

Expected JSON schema format:
{
  "matches": [
    {
      "id": "product-id",
      "name": "Product Name",
      "slug": "product-slug",
      "brand": "Brand",
      "image": "image-url",
      "salePrice": 123000,
      "marketplace": "Shopee",
      "affiliateUrl": "https://...",
      "confidenceScore": 95,
      "matchReason": "Detailed reason here...",
      "stylingAdvice": "Styling advice here...",
      "matchBadges": ["Badge 1", "Badge 2"]
    }
  ],
  "analysisSummary": "Curation summary here..."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.2
      }
    });

    const text = response.text || "{}";
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const resultJson = JSON.parse(cleanedText);
    res.json(resultJson);
  } catch (err) {
    console.error("Gemini AI API Call failed", err);
    res.status(500).json({ error: "Gemini intelligence engine is temporarily unavailable" });
  }
});

// 5. POST /api/admin/login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const expectedEmail = process.env.ADMIN_EMAIL || "scout@lookverse.io";
  const expectedPassword = process.env.ADMIN_PASSWORD || "password";

  if (
    (email === expectedEmail || email === "admin@lookverse.com") &&
    password === expectedPassword
  ) {
    return res.json({ success: true, email: expectedEmail });
  } else {
    return res.status(401).json({ success: false, error: "UNAUTHORIZED SPECIMEN: INVALID EMAIL OR ACCESS CODE PASSWORD." });
  }
});

// 6. GET /api/admin/config
app.get("/api/admin/config", (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL || "scout@lookverse.io";
  const adminPassword = process.env.ADMIN_PASSWORD || "password";
  res.json({
    adminEmail,
    adminPassword, // Expose for easy copy-paste in the demo login screen
    hasCustomCredentials: !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD)
  });
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in DEVELOPMENT mode with Vite Middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in PRODUCTION mode with static file distribution...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully routed to port ${PORT}`);
    console.log(`Development: http://localhost:${PORT}`);
  });
}

startServer();
