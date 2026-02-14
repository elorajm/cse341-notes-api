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

// Notes routes live in routes/notes.js (and swagger docs should live there too)
router.use("/notes", require("./notes"));

module.exports = router;
