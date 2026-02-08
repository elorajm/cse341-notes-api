const router = require("express").Router();

// Test route
router.get("/", (req, res) => {
  res.send("CSE 341 Notes API is running");
});

// Notes routes
router.use("/notes", require("./notes"));

module.exports = router;
