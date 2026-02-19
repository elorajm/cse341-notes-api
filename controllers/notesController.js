const { ObjectId } = require("mongodb");
const createError = require("http-errors");

function getNotesCollection(req) {
  const db = req.app.locals.db;
  if (!db) throw createError(503, "Database not available");
  return db.collection("notes");
}

// GET /notes
async function getAllNotes(req, res, next) {
  try {
    const notes = await getNotesCollection(req)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(notes);
  } catch (err) {
    next(err);
  }
}

// GET /notes/:id
async function getNoteById(req, res, next) {
  try {
    const note = await getNotesCollection(req).findOne({
      _id: new ObjectId(req.params.id)
    });
    if (!note) return next(createError(404, "Note not found"));
    res.status(200).json(note);
  } catch (err) {
    next(err);
  }
}

// POST /notes
async function createNote(req, res, next) {
  try {
    const { title, content, summary, tags, isPinned } = req.body;
    const now = new Date();

    const result = await getNotesCollection(req).insertOne({
      title,
      content,
      summary: summary || null,
      tags: tags || [],
      isPinned: isPinned || false,
      userId: req.user._id.toString(),
      createdAt: now,
      updatedAt: now
    });

    res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    next(err);
  }
}

// PUT /notes/:id
async function updateNote(req, res, next) {
  try {
    const { title, content, summary, tags, isPinned } = req.body;

    const result = await getNotesCollection(req).updateOne(
      { _id: new ObjectId(req.params.id) },
      {
        $set: {
          title,
          content,
          summary: summary ?? null,
          tags: tags ?? [],
          isPinned: isPinned ?? false,
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) return next(createError(404, "Note not found"));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// DELETE /notes/:id
async function deleteNote(req, res, next) {
  try {
    const result = await getNotesCollection(req).deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) return next(createError(404, "Note not found"));
    res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllNotes, getNoteById, createNote, updateNote, deleteNote };
