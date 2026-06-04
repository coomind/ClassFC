const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../db");
const { sign } = require("../auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "missing fields" });

  const [rows] = await pool.query("SELECT * FROM accounts WHERE username = ?", [username]);
  if (rows.length === 0) return res.status(401).json({ error: "invalid credentials" });

  const u = rows[0];
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });

  const payload = {
    id: u.id,
    username: u.username,
    name: u.name,
    number: u.number,
    role: u.role
  };
  res.json({ token: sign(payload), user: payload });
});

router.post("/signup", async (req, res) => {
  const { username, password, name, number, email } = req.body || {};
  if (!username || !password || !name) return res.status(400).json({ error: "missing fields" });
  if (password.length < 6) return res.status(400).json({ error: "password too short" });

  const hash = await bcrypt.hash(password, 10);
  try {
    const [r] = await pool.query(
      "INSERT INTO accounts (username, password_hash, name, number, email) VALUES (?, ?, ?, ?, ?)",
      [username, hash, name, number || null, email || null]
    );
    const payload = {
      id: r.insertId,
      username: username,
      name: name,
      number: number,
      role: "member"
    };
    res.json({ token: sign(payload), user: payload });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "username or email already taken" });
    res.status(500).json({ error: e.message });
  }
});

router.get("/me", async (req, res) => {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.json(null);
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    res.json(p);
  } catch {
    res.json(null);
  }
});

module.exports = router;
