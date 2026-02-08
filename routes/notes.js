const router = require("express").Router();

// Temporary in-memory data (no MongoDB yet)
let notes = [
  {
    _id: "1",
    title: "First note",
    content: "This is a test note.",
    createdAt: new Date()
  }
];
let nextId = 2;

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
router.get("/", (req, res) => {
  res.status(200).json(notes);
});

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
 *         description: One note (or null if not found)
 */
router.get("/:id", (req, res) => {
  const note = notes.find((n) => n._id === req.params.id) || null;
  res.status(200).json(note);
});

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
router.post("/", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Missing fields: title, content" });
  }

  const newNote = {
    _id: String(nextId++),
    title,
    content,
    createdAt: new Date()
  };

  notes.push(newNote);
  res.status(201).json({ id: newNote._id });
});

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
 *         description: Missing required fields
 */
router.put("/:id", (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Missing fields: title, content" });
  }

  const index = notes.findIndex((n) => n._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Note not found" });
  }

  notes[index] = { ...notes[index], title, content };
  return res.status(204).send();
});

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
 */
router.delete("/:id", (req, res) => {
  const index = notes.findIndex((n) => n._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: "Note not found" });
  }

  notes.splice(index, 1);
  return res.status(200).json({ message: "Note deleted" });
});

module.exports = router;
