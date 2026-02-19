const router = require("express").Router();
const notesController = require("../controllers/notesController");
const { isAuthenticated } = require("../middleware/auth");
const { validateId, validateNoteBody } = require("../middleware/validation");

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Notes endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NoteInput:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 100
 *         content:
 *           type: string
 *         summary:
 *           type: string
 *           maxLength: 200
 *           nullable: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isPinned:
 *           type: boolean
 *           default: false
 *     Note:
 *       allOf:
 *         - $ref: '#/components/schemas/NoteInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             userId:
 *               type: string
 *               description: ID of the user who created this note
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 */
router.get("/", notesController.getAllNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: One note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid ID
 *       404:
 *         description: Note not found
 */
router.get("/:id", validateId, notesController.getNoteById);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a note
 *     tags: [Notes]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Created — returns new note id
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not logged in
 */
router.post("/", isAuthenticated, validateNoteBody, notesController.createNote);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
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
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       204:
 *         description: Updated successfully
 *       400:
 *         description: Validation error or invalid ID
 *       401:
 *         description: Not logged in
 *       404:
 *         description: Note not found
 */
router.put("/:id", isAuthenticated, validateId, validateNoteBody, notesController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
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
 *         description: Note not found
 */
router.delete("/:id", isAuthenticated, validateId, notesController.deleteNote);

module.exports = router;
