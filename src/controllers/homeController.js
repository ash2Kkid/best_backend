import Home from "../models/Home.js";

export const createHome = async (req, res) => {
  const home = await Home.create({
    name: req.body.name,
    admin: req.user.id,
    members: [{ user: req.user.id, role: "ADMIN" }]
  });

  res.json(home);
};

export const myHomes = async (req, res) => {
  const homes = await Home.find({
    "members.user": req.user.id
  });

  res.json(homes);
};
