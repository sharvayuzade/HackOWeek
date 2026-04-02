export function attachUser(req, _res, next) {
  req.user = {
    id: req.header("x-user-id") || "guest-user",
    role: (req.header("x-user-role") || "viewer").toLowerCase()
  };

  next();
}

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        error: "forbidden",
        message: "You do not have permission to access this resource."
      });
    }

    return next();
  };
}
