const { MongoClient } = require("mongodb");

let database;

const connectToDatabase = async () => {
  if (database) return database;

  const client = new MongoClient(process.env.MONGODB_URI);

  await client.connect();
  database = client.db();

  console.log("Connected to MongoDB");
  return database;
};

const getDb = () => {
  if (!database) {
    throw new Error("Database not initialized");
  }
  return database;
};

module.exports = { connectToDatabase, getDb };
