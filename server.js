require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { MongoClient } = require("mongodb");

const app = express();

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());

// -------------------- Port --------------------
const port = process.env.PORT || 8080;

// -------------------- MongoDB --------------------
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "cse341-notes-api";

async function connectDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is missing in your .env file");
  }

  // Recommended options for modern Mongo driver
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);

  // Make db/client available everywhere via app.locals
  app.locals.db = db;
  app.locals.mongoClient = client;

  console.log(`Connected to MongoDB (db: ${dbName})`);
}

// -------------------- Swagger --------------------
const baseUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${port}`;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "CSE 341 Notes API"
    },
    servers: [{ url: baseUrl }]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- Routes --------------------
app.use("/", require("./routes"));

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// -------------------- Global Error Handler --------------------
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// -------------------- Start Server (after DB connects) --------------------
connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Swagger docs at ${baseUrl}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
