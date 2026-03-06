export function requireRole(role) {
  return function roleMiddleware(req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `${role} access required` });
    }
    next();
  };
}

export const requireAdmin = requireRole("admin");
