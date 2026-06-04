const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "bad token" });
  }
}

function optionalAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch {}
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ error: "admin only" });
}

module.exports = { sign, auth, optionalAuth, adminOnly };
