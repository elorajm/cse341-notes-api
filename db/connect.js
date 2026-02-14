const { MongoClient } = require("mongodb");

let db;
let client;

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error("Missing MONGODB_URI in environment variables.");
    }

    client = new MongoClient(uri);
    await client.connect();

    db = client.db(process.env.DB_NAME || "cse341-notes-api");

    console.log("Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1); // stop the app if DB fails
  }
};

const getDb = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectToDatabase first.");
  }
  return db;
};

module.exports = { connectToDatabase, getDb };
