import Home from "../models/Home.js";

const authorizeHome = async (req, res, next) => {
  const userId = req.user.id;
  const { homeId } = req.params;

  const home = await Home.findById(homeId);
  if (!home) return res.status(404).json({ msg: "Home not found" });

  const allowed = home.members.some(
    m => m.user.toString() === userId
  );

  if (!allowed)
    return res.status(403).json({ msg: "Access denied" });

  req.home = home;
  next();
};

export default authorizeHome;
