const { ObjectId } = require("mongodb");
const createError = require("http-errors");

function getUsersCollection(req) {
  const db = req.app.locals.db;
  if (!db) throw createError(503, "Database not available");
  return db.collection("users");
}

// GET /users
async function getAllUsers(req, res, next) {
  try {
    const users = await getUsersCollection(req)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

// GET /users/:id
async function getUserById(req, res, next) {
  try {
    const user = await getUsersCollection(req).findOne({
      _id: new ObjectId(req.params.id)
    });
    if (!user) return next(createError(404, "User not found"));
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}

// POST /users  (manual creation — OAuth creation is handled by passport)
async function createUser(req, res, next) {
  try {
    const { githubId, username, displayName, email, avatarUrl, profileUrl } =
      req.body;

    const now = new Date();
    const result = await getUsersCollection(req).insertOne({
      githubId,
      username,
      displayName: displayName || username,
      email: email || null,
      avatarUrl: avatarUrl || null,
      profileUrl: profileUrl || null,
      createdAt: now,
      lastLogin: now
    });

    res.status(201).json({ id: result.insertedId.toString() });
  } catch (err) {
    next(err);
  }
}

// PUT /users/:id
async function updateUser(req, res, next) {
  try {
    const { displayName, email, avatarUrl } = req.body;

    const result = await getUsersCollection(req).updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { displayName, email, avatarUrl } }
    );

    if (result.matchedCount === 0) return next(createError(404, "User not found"));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

// DELETE /users/:id
async function deleteUser(req, res, next) {
  try {
    const result = await getUsersCollection(req).deleteOne({
      _id: new ObjectId(req.params.id)
    });
    if (result.deletedCount === 0) return next(createError(404, "User not found"));
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
