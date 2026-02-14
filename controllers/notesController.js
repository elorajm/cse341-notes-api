const { ObjectId } = require("mongodb");

// Helper: get notes collection from app.locals.db
function getNotesCollection(req) {
  const db = req.app.locals.db;
  if (!db) {
    throw new Error("Database not available. Did MongoDB connect?");
  }
  return db.collection("notes");
}

// GET /notes
async function getAllNotes(req, res) {
  try {
    const notesCollection = getNotesCollection(req);

    const notes = await notesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json(notes);
  } catch (err) {
    console.error("getAllNotes error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// GET /notes/:id
async function getNoteById(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const notesCollection = getNotesCollection(req);
    const note = await notesCollection.findOne({ _id: new ObjectId(id) });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json(note);
  } catch (err) {
    console.error("getNoteById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /notes
async function createNote(req, res) {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Missing fields: title, content" });
    }

    const notesCollection = getNotesCollection(req);

    const newNote = {
      title,
      content,
      createdAt: new Date()
    };

    const result = await notesCollection.insertOne(newNote);

    return res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    console.error("createNote error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// PUT /notes/:id
async function updateNote(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Missing fields: title, content" });
    }

    const notesCollection = getNotesCollection(req);

    const result = await notesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { title, content } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    // 204 = success with no body
    return res.status(204).send();
  } catch (err) {
    console.error("updateNote error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// DELETE /notes/:id
async function deleteNote(req, res) {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid note id" });
    }

    const notesCollection = getNotesCollection(req);
    const result = await notesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    return res.status(200).json({ message: "Note deleted" });
  } catch (err) {
    console.error("deleteNote error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getAllNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote
};
