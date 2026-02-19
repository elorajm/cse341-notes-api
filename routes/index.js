const router = require("express").Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Health check
 *     description: Confirms the API is running
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/", (req, res) => {
  res.status(200).send("CSE 341 Notes API is running");
});

router.use("/auth", require("./auth"));
router.use("/notes", require("./notes"));
router.use("/users", require("./users"));

module.exports = router;
