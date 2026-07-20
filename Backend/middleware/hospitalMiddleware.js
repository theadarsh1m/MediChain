/**
 * Middleware to restrict access to hospital users only.
 * Assumes authMiddleware has run and populated req.user.
 */
function hospitalMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated." });
  }

  if (req.user.role !== "hospital") {
    return res.status(403).json({ message: "Access denied: Hospital users only." });
  }

  next();
}

module.exports = hospitalMiddleware;
