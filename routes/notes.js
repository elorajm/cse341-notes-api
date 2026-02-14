const router = require("express").Router();
const notesController = require("../controllers/notesController");

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
 *         content:
 *           type: string
 *     Note:
 *       allOf:
 *         - $ref: '#/components/schemas/NoteInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *             createdAt:
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
 *       404:
 *         description: Note not found
 *       400:
 *         description: Invalid ID
 */
router.get("/:id", notesController.getNoteById);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a note
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NoteInput'
 *     responses:
 *       201:
 *         description: Created (returns id)
 *       400:
 *         description: Missing required fields
 */
router.post("/", notesController.createNote);

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
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
 *       404:
 *         description: Note not found
 *       400:
 *         description: Missing required fields or invalid ID
 */
router.put("/:id", notesController.updateNote);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Note not found
 *       400:
 *         description: Invalid ID
 */
router.delete("/:id", notesController.deleteNote);

module.exports = router;
