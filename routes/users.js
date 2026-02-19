const router = require("express").Router();
const usersController = require("../controllers/usersController");
const { isAuthenticated } = require("../middleware/auth");
const { validateId, validateUserBody } = require("../middleware/validation");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management (requires login)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         githubId:
 *           type: string
 *         username:
 *           type: string
 *         displayName:
 *           type: string
 *         email:
 *           type: string
 *           nullable: true
 *         avatarUrl:
 *           type: string
 *           nullable: true
 *         profileUrl:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         lastLogin:
 *           type: string
 *           format: date-time
 *     UserInput:
 *       type: object
 *       required:
 *         - githubId
 *         - username
 *       properties:
 *         githubId:
 *           type: string
 *         username:
 *           type: string
 *         displayName:
 *           type: string
 *         email:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         profileUrl:
 *           type: string
 *     UserUpdate:
 *       type: object
 *       properties:
 *         displayName:
 *           type: string
 *         email:
 *           type: string
 *         avatarUrl:
 *           type: string
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Not logged in
 */
router.get("/", isAuthenticated, usersController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: One user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Not logged in
 *       404:
 *         description: User not found
 */
router.get("/:id", isAuthenticated, validateId, usersController.getUserById);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user manually
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     description: >
 *       Manually inserts a user document. In normal usage users are created
 *       automatically on first GitHub login via /auth/github.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: Created — returns new user id
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not logged in
 */
router.post("/", isAuthenticated, validateUserBody, usersController.createUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserUpdate'
 *     responses:
 *       204:
 *         description: Updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not logged in
 *       404:
 *         description: User not found
 */
router.put("/:id", isAuthenticated, validateId, usersController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       400:
 *         description: Invalid ID
 *       401:
 *         description: Not logged in
 *       404:
 *         description: User not found
 */
router.delete("/:id", isAuthenticated, validateId, usersController.deleteUser);

module.exports = router;
