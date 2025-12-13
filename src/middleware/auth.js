import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 IMPORTANT FIX:
    // store ONLY the user ID, not the whole JWT payload
    req.user = decoded.id;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}
