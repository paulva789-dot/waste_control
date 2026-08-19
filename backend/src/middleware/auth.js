const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Decodes the token if one is present, but never rejects the request —
// used by routes that allow both anonymous and authenticated callers
// (e.g. anonymous complaint reporting).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // Invalid/expired token on an optional-auth route: proceed as anonymous.
    }
  }
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}

function requirePremium(req, res, next) {
  if (!req.user?.isPremium) {
    return res.status(403).json({ error: "Premium membership required", code: "PREMIUM_REQUIRED" });
  }
  next();
}

function requireUnlock(req, res, next) {
  if (!req.user?.hasUnlockedTracking) {
    return res.status(403).json({ error: "Unlock tracking access required", code: "UNLOCK_REQUIRED" });
  }
  next();
}

module.exports = { requireAuth, optionalAuth, requireRole, requirePremium, requireUnlock };
