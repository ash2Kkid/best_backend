import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔑 DEBUG: print decoded JWT
    console.log("DECODED JWT:", decoded);

    // 🔑 IMPORTANT FIX:
    // store the full decoded JWT instead of just the ID
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ msg: "Invalid token" });
  }
}
