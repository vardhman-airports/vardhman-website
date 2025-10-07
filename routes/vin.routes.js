import express, { Router } from "express";
import multer from "multer";
import mongoose, { Schema, model, Types } from "mongoose";

const router = Router();

// Allow large JSON bodies for base64 images
router.use(express.json({ limit: '20mb' }));
router.use(express.urlencoded({ extended: true, limit: '20mb' }));

/** ---------- DB connection (loud + reusable, single file) ---------- */

const MONGODB_URI =
  process.env.MONGODB_URI;

let connecting = null; // Promise or null

async function ensureDb() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) return;
  if (!connecting) {
    connecting = mongoose.connect(MONGODB_URI).catch((err) => {
      connecting = null;
      console.error("[mongo] connect error:", err);
      throw err;
    });
  }
  await connecting;
}

mongoose.connection.on("connected", () => {
  console.log("[mongo] connected:", mongoose.connection.name);
});
mongoose.connection.on("error", (e) => console.error("[mongo] error:", e));
mongoose.connection.on("disconnected", () => console.warn("[mongo] disconnected"));

// Ensure DB before any handler runs
router.use(async (_req, _res, next) => {
  try {
    await ensureDb();
    next();
  } catch (e) {
    next(e);
  }
});

/** ---------- Schemas (efficient) ---------- */

const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true }, // full body
    images: [{ type: String, trim: true }],
    links: [{ type: String, trim: true }], // spotify & misc URLs
    date: { type: Date }, // optional explicit date
  },
  {
    timestamps: true, // createdAt, updatedAt
    versionKey: false,
  }
);
BlogSchema.index({ createdAt: -1 });

const CommentSchema = new Schema(
  {
    blogId: { type: Types.ObjectId, ref: "Blog", required: true, index: true },
    author: { type: String, default: "cutie", trim: true, maxlength: 60 },
    text: { type: String, required: true, maxlength: 2000 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);
CommentSchema.index({ blogId: 1, createdAt: 1 });

const PopupSchema = new Schema(
  {
    key: { type: String, required: true, trim: true }, // "stage1", "stage2"
    order: { type: Number, required: true, min: 0, index: true },
    message: { type: String, required: true },
    limit: { type: Number, required: true, min: 0 }, // how many visits this appears
  },
  { versionKey: false }
);
PopupSchema.index({ key: 1 }, { unique: true });

// Store uploaded images in MongoDB (no local disk)
const ImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

const VisitSchema = new Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    visitCount: { type: Number, default: 0, min: 0, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    versionKey: false,
  }
);

// Avoid model recompilation errors / duplicates during hot reload in dev
const Blog = mongoose.models.Blog || model("Blog", BlogSchema);
const Comment = mongoose.models.Comment || model("Comment", CommentSchema);
const Popup = mongoose.models.Popup || model("Popup", PopupSchema);
const Image = mongoose.models.Image || model("Image", ImageSchema);
const Visit = mongoose.models.Visit || model("Visit", VisitSchema);

/** ---------- Healthcheck ---------- */
router.get("/healthz", async (_req, res) => {
  try {
    await ensureDb();
    const state = mongoose.connection.readyState; // 1 = OK
    res.json({ ok: state === 1, db: mongoose.connection.name, state });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e && e.message ? e.message : e) });
  }
});

/** ---------- File uploads (images -> DB as data URLs) ---------- */

// Use memoryStorage; we will convert to base64 data URL and return it so
// the client can store the string inside the Blog.images array.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    if (!/^image\//.test(file.mimetype || "")) return cb(new Error("invalid_type"));
    cb(null, true);
  },
});

// POST /upload – expects form-data field "image"; saves to Mongo and returns URL
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const f = req.file;
    if (!f) return res.status(400).json({ error: "file_required" });
    const doc = await Image.create({ data: f.buffer, contentType: f.mimetype || "image/jpeg" });
    const url = `/api/images/${doc._id}`; // absolute API URL for frontend storage
    res.status(201).json({ url, id: doc._id, size: f.size, type: f.mimetype });
  } catch (e) {
    console.error("[/upload] failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Serve image bytes from MongoDB
router.get("/images/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const img = await Image.findById(id, { data: 1, contentType: 1 });
    if (!img || !img.data) return res.sendStatus(404);
    res.setHeader("Content-Type", img.contentType || "image/jpeg");
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    const buf = Buffer.isBuffer(img.data) ? img.data : Buffer.from(img.data);
    return res.end(buf);
  } catch (e) {
    console.error("[/images/:id] failed:", e);
    res.sendStatus(400);
  }
});

/** ---------- Popups & Visits ---------- */

// Handler supports both POST and GET to be resilient behind strict proxies/CDNs
async function handleNextVisit(req, res) {
  try {
    const { clientId } = req.body || {};
    const key = clientId && String(clientId).trim() ? String(clientId).trim() : "__global__";

    const v = await Visit.findOneAndUpdate(
      { clientId: key },
      { $inc: { visitCount: 1 } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    const all = await Popup.find({}, { _id: 0, key: 1, order: 1, message: 1, limit: 1 })
      .sort({ order: 1 })
      .lean();

    const visitCount = v && typeof v.visitCount === "number" ? v.visitCount : 0;
    const matches = all.filter((p) => (Number(p.limit) || 0) >= visitCount);
    const first = matches.length ? { key: matches[0].key, message: matches[0].message } : null;
    res.json({ visitCount, popup: first, popups: matches });
  } catch (e) {
    console.error("[/visits/next] failed:", e);
    res.status(500).json({ error: "server_error" });
  }
}

// POST /visits/next (primary)
router.post("/visits/next", handleNextVisit);
// GET /visits/next (fallback for environments blocking POST)
router.get("/visits/next", handleNextVisit);

// Debug: peek next popup (no increment)
async function handlePeek(req, res) {
  try {
    const clientId = req.params.clientId;
    const key = clientId && String(clientId).trim() ? String(clientId).trim() : "__global__";

    const v = await Visit.findOne({ clientId: key }).lean();
    const current = v ? v.visitCount || 0 : 0;
    const next = current + 1;

    const popups = await Popup.find({}, { _id: 0, key: 1, order: 1, message: 1, limit: 1 })
      .sort({ order: 1 })
      .lean();

    const matches = popups.filter((p) => (Number(p.limit) || 0) >= next);
    const first = matches.length ? { key: matches[0].key, message: matches[0].message } : null;
    res.json({ current, next, popup: first, popups: matches });
  } catch (e) {
    console.error("[/visits/peek] failed:", e);
    res.status(500).json({ error: "server_error" });
  }
}

router.get("/visits/peek", handlePeek);
router.get("/visits/peek/:clientId", handlePeek);

// Debug: get a visit record by clientId
router.get("/visits", async (_req, res) => {
  try {
    const key = "__global__";
    const v = await Visit.findOne({ clientId: key }).lean();
    if (!v) return res.json({ visitCount: 0 });
    res.json(v);
  } catch (e) {
    console.error("[/visits] get failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/visits/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const key = clientId && String(clientId).trim() ? String(clientId).trim() : "__global__";
    const v = await Visit.findOne({ clientId: key }).lean();
    if (!v) return res.json({ visitCount: 0 });
    res.json(v);
  } catch (e) {
    console.error("[/visits/:clientId] get failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Debug: delete/reset a visit record for a clientId
router.delete("/visits", async (_req, res) => {
  try {
    const key = "__global__";
    const r = await Visit.deleteOne({ clientId: key });
    if (r.deletedCount === 0) return res.status(404).json({ error: "not_found" });
    res.sendStatus(204);
  } catch (e) {
    console.error("[/visits] delete failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

router.delete("/visits/:clientId", async (req, res) => {
  try {
    const clientId = req.params.clientId;
    const key = clientId && String(clientId).trim() ? String(clientId).trim() : "__global__";
    const r = await Visit.deleteOne({ clientId: key });
    if (r.deletedCount === 0) return res.status(404).json({ error: "not_found" });
    res.sendStatus(204);
  } catch (e) {
    console.error("[/visits/:clientId] delete failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

/** ---------- Helpers ---------- */

function parseOptionalISO(d) {
  if (!d) return undefined;
  // Accept YYYY-MM-DD or full ISO; otherwise ignore
  const looksIso = /^\d{4}-\d{2}-\d{2}/.test(d);
  if (!looksIso) return undefined;
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? undefined : dt;
}

/** ---------- Blogs ---------- */

// List (cursor/createdAt pagination for mobile)
router.get("/blogs", async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit ?? "10"), 10), 30);
    const beforeRaw = req.query.before;

    let filter = {};
    if (beforeRaw) {
      const d = new Date(beforeRaw);
      if (Number.isNaN(d.getTime())) {
        console.warn("[/blogs] ignoring invalid before cursor:", beforeRaw);
      } else {
        filter = { createdAt: { $lt: d } };
      }
    }

    const items = await Blog.find(filter).sort({ createdAt: -1 }).limit(limit).lean();

    // Defensive dedupe
    const unique = Array.from(new Map(items.map((i) => [String(i._id), i])).values());
    const nextCursor = unique.length ? unique[unique.length - 1].createdAt : null;
    res.json({ items: unique, nextCursor });
  } catch (e) {
    console.error("[/blogs] list failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/blogs/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.sendStatus(404);
    res.json(blog);
  } catch (e) {
    console.error("[/blogs/:id] get failed:", e);
    res.sendStatus(400);
  }
});

// Create (admin – no auth per your spec)
router.post("/blogs", async (req, res) => {
  try {
    const { title, description, images = [], links = [], date } = req.body || {};
    const doc = await Blog.create({
      title,
      description,
      images: (images || []).map((s) => (s || "").trim()).filter(Boolean),
      links: (links || []).map((s) => (s || "").trim()).filter(Boolean),
      date: parseOptionalISO(date),
    });
    res.status(201).json({ id: doc._id });
  } catch (e) {
    console.error("[/blogs] create failed:", e);
    const msg = String(e);
    const code = /ValidationError|Cast to/.test(msg) ? 400 : 500;
    res.status(code).json({ error: code === 400 ? "invalid_payload" : "server_error" });
  }
});

/** ---------- Comments ---------- */

router.get("/blogs/:id/comments", async (req, res) => {
  try {
    const blogId = req.params.id;
    const list = await Comment.find({ blogId }, { __v: 0 }).sort({ createdAt: 1 }).lean();
    res.json(list);
  } catch (e) {
    console.error("[/blogs/:id/comments] list failed:", e);
    res.sendStatus(400);
  }
});

router.post("/blogs/:id/comments", async (req, res) => {
  try {
    const blogId = new Types.ObjectId(req.params.id);
    const { author, text } = req.body || {};
    if (!text || !text.trim()) return res.status(400).json({ error: "text_required" });
    const c = await Comment.create({ blogId, author: (author || "💬").trim(), text: text.trim() });
    res.status(201).json({ id: c._id });
  } catch (e) {
    console.error("[/blogs/:id/comments] create failed:", e);
    res.status(400).json({ error: "invalid_payload" });
  }
});

/** ---------- Popups admin (optional tiny helpers) ---------- */

router.get("/popups", async (_req, res) => {
  const items = await Popup.find({}).sort({ order: 1 }).lean();
  res.json(items);
});

router.post("/popups", async (req, res) => {
  try {
    const { key, order, message, limit } = req.body;
    const p = await Popup.create({ key, order, message, limit });
    res.status(201).json({ id: p._id });
  } catch (e) {
    console.error("[/popups] create failed:", e);
    res.status(400).json({ error: "invalid_popup" });
  }
});

// Replace all popups in one request (admin helper)
router.post("/popups/bulk", async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (!items.every((i) => i && typeof i.key === "string"))
      return res.status(400).json({ error: "invalid_payload" });

    await Popup.deleteMany({});
    const docs = await Popup.insertMany(
      items.map((it) => ({
        key: it.key,
        order: Number(it.order) || 0,
        message: it.message || "",
        limit: Number(it.limit) || 0,
      }))
    );
    res.status(201).json({ inserted: docs.length });
  } catch (e) {
    console.error("[/popups/bulk] failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

/** ---------- Link preview helper ---------- */

router.get("/preview", async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: "url_required" });
    let parsed;
    try {
      parsed = new URL(url);
    } catch {
      return res.status(400).json({ error: "invalid_url" });
    }

    const allowedHosts = [
      "pinterest.com",
      "i.pinimg.com",
      "pin.it",
      "instagram.com",
      "www.instagram.com",
      "instagr.am",
      "cdninstagram.com",
    ];
    if (!allowedHosts.some((h) => parsed.hostname.includes(h)))
      return res.status(400).json({ error: "not_allowed" });

    const r = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
        referer: "https://www.instagram.com/",
      },
    });
    if (!r.ok) return res.status(502).json({ error: "fetch_failed" });
    const text = await r.text();

    let ogImage =
      (text.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || [])[1] ||
      (text.match(/<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["']/i) || [])[1] ||
      (text.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) || [])[1] ||
      null;

    const title =
      (text.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) || [])[1] ||
      (text.match(/<title[^>]*>([^<]+)<\/title>/i) || [])[1] ||
      null;

    if (!ogImage) {
      ogImage = (text.match(/<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i) || [])[1] || null;
    }

    if (!ogImage) {
      const imgSrc =
        (text.match(/<img[^>]+srcset=["']([^"']*i\.pinimg\.[^"']+)["']/i) || [])[1] ||
        (text.match(/<img[^>]+src=["']([^"']*i\.pinimg\.[^"']+)["']/i) || [])[1] ||
        null;
      if (imgSrc) ogImage = imgSrc;
    }

    if (!ogImage) {
      const jsonLdMatch = text.match(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
      if (jsonLdMatch) {
        try {
          const j = JSON.parse(jsonLdMatch[1]);
          if (j) {
            if (typeof j.image === "string") ogImage = ogImage || j.image;
            else if (Array.isArray(j.image) && j.image.length) ogImage = ogImage || j.image[0];
            else if (j.mainEntity && j.mainEntity.image) ogImage = ogImage || j.mainEntity.image;
          }
        } catch {
          /* ignore */
        }
      }

      try {
        const shared = text.match(/window\._sharedData\s*=\s*(\{[\s\S]*?\});/);
        if (shared) {
          const obj = JSON.parse(shared[1]);
          const media =
            obj &&
            obj.entry_data &&
            obj.entry_data.PostPage &&
            obj.entry_data.PostPage[0] &&
            obj.entry_data.PostPage[0].graphql &&
            obj.entry_data.PostPage[0].graphql.shortcode_media;
          if (media) {
            if (media.display_url) ogImage = ogImage || media.display_url;
            else if (media.display_resources && media.display_resources.length)
              ogImage =
                ogImage ||
                media.display_resources[media.display_resources.length - 1].src ||
                media.display_resources[0].src;
          }
        }
      } catch {
        /* ignore */
      }

      if (!ogImage) {
        const m1 = text.match(/"display_url"\s*:\s*"([^"]+)"/i);
        if (m1) ogImage = decodeURIComponent(m1[1]);
      }
      if (!ogImage) {
        const m2 = text.match(/"display_resources"\s*:\s*\[([\s\S]*?)\]/i);
        if (m2) {
          const mm = m2[1].match(/"src"\s*:\s*"([^"]+)"/i);
          if (mm) ogImage = decodeURIComponent(mm[1]);
        }
      }
    }

    if (ogImage) {
      try {
        ogImage = new URL(ogImage, url).href;
      } catch {
        /* keep as-is */
      }
    }

    if (!ogImage && /instagram\.com|instagr\.am/.test(parsed.hostname)) {
      const token = process.env.INSTAGRAM_OEMBED_TOKEN || process.env.FB_OEMBED_TOKEN;
      if (token) {
        try {
          const oe = await fetch(
            `https://graph.facebook.com/v11.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${encodeURIComponent(
              token
            )}`
          );
          if (oe.ok) {
            const j = await oe.json();
            if (j && (j.thumbnail_url || j.url)) {
              ogImage = ogImage || j.thumbnail_url || j.url || null;
            }
          }
        } catch {
          /* ignore */
        }
      }
    }

    res.json({ image: ogImage || null, title });
  } catch (e) {
    console.error("[/preview] failed:", e);
    res.status(500).json({ error: "server_error" });
  }
});

// Delete a blog by id (admin)
router.delete("/blogs/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Blog.deleteOne({ _id: id });
    if (r.deletedCount === 0) return res.sendStatus(404);
    res.sendStatus(204);
  } catch (e) {
    console.error("[/blogs/:id] delete failed:", e);
    res.status(400).json({ error: "invalid_id" });
  }
});

export default router;
