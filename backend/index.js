require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");
const { ping } = require("./db");
const authRoutes = require("./routes/authRoutes");
const memberRoutes = require("./routes/memberRoutes");
const matchRoutes = require("./routes/matchRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || "*").split(",").map((s) => s.trim());
app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error("CORS blocked: " + origin));
    },
    credentials: true
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", async (req, res) => {
  try {
    const ok = await ping();
    res.json({ ok: ok, db: ok ? "up" : "down", time: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, db: "error", error: e.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "internal error" });
});

const port = process.env.PORT || 3001;
app.listen(port, function () {
  console.log("CLASS FC API listening on :" + port);
});
