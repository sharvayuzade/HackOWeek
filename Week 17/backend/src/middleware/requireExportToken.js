export const requireExportToken = (req, res, next) => {
  const configuredToken = process.env.EXPORT_TOKEN;
  if (!configuredToken) {
    return res.status(500).json({ error: "EXPORT_TOKEN is not configured" });
  }

  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || token !== configuredToken) {
    return res.status(401).json({ error: "Unauthorized export request" });
  }

  return next();
};