const router = require("express").Router();
const passport = require("passport");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: GitHub OAuth authentication
 */

/**
 * @swagger
 * /auth/github:
 *   get:
 *     summary: Log in with GitHub
 *     tags: [Auth]
 *     description: >
 *       Redirects the browser to GitHub's authorization page.
 *       After the user approves access, GitHub redirects back to
 *       /auth/github/callback.  Open this URL directly in a browser —
 *       it cannot be triggered from Swagger UI.
 *     responses:
 *       302:
 *         description: Redirect to GitHub
 */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [Auth]
 *     description: >
 *       GitHub redirects the user here after they approve access.
 *       On success the session is established and the response contains
 *       the user's profile.  This endpoint is handled automatically;
 *       you do not call it directly.
 *     responses:
 *       200:
 *         description: Login successful — returns logged-in user profile
 *       401:
 *         description: Authentication failed
 */
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth/failure" }),
  (req, res) => {
    res.redirect("/");
  }
);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     description: Returns the profile of the currently logged-in user.
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not logged in
 */
router.get("/profile", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not logged in" });
  }
  res.status(200).json(req.user);
});

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Log out
 *     tags: [Auth]
 *     description: Destroys the session and logs the user out.
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

/**
 * @swagger
 * /auth/failure:
 *   get:
 *     summary: Authentication failure
 *     tags: [Auth]
 *     responses:
 *       401:
 *         description: Authentication failed
 */
router.get("/failure", (req, res) => {
  res.status(401).json({ error: "GitHub authentication failed" });
});

module.exports = router;
