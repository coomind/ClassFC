const jwt = require("jsonwebtoken");

require("dotenv").config();

const SECRET = process.env.JWT_SECRET;

function sign(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

function getToken(req) {
  const header = req.headers.authorization || "";

  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }

  return null;
}

// 로그인 확인
function auth(req, res, next) {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ error: "no token" });
  }

  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: "bad token" });
  }
}

// 토큰이 있으면 사용자 정보 확인
function optionalAuth(req, res, next) {
  const token = getToken(req);

  if (token) {
    try {
      req.user = jwt.verify(token, SECRET);
    } catch (error) {}
  }

  next();
}

// 관리자만 접근 가능
function adminOnly(req, res, next) {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  res.status(403).json({ error: "admin only" });
}

module.exports = { sign, auth, optionalAuth, adminOnly };
