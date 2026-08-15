/**
 * Middleware to restrict access to patient users only.
 * Assumes authMiddleware has run and populated req.user.
 */
function patientMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized: User not authenticated." });
  }

  if (req.user.role !== "patient") {
    return res.status(403).json({ message: "Access denied: Patient users only." });
  }

  next();
}

module.exports = patientMiddleware;
