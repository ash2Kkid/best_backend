const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { getDeviceData } = require("../controllers/dataController");

router.get("/:deviceId", auth, getDeviceData);

module.exports = router;
