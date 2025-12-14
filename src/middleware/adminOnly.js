export default function adminOnly(req, res, next) {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ msg: "Admins only" });
  }
  next();
}