require("dotenv").config();

const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const { MongoClient } = require("mongodb");
const { isCelebrateError } = require("celebrate");
const configurePassport = require("./config/passport");

const app = express();

// -------------------- Middleware --------------------
app.use(cors());
app.use(express.json());

// Session must be registered before passport
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true when deploying with HTTPS on Render
  })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------- Port --------------------
const port = process.env.PORT || 8080;

// -------------------- MongoDB --------------------
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || "cse341-notes-api";

async function connectDb() {
  if (!uri) {
    throw new Error("MONGODB_URI is missing in your .env file");
  }
  const client = new MongoClient(uri);
  await client.connect();

  const db = client.db(dbName);
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
      description:
        "CSE 341 Notes API — authenticate via GET /auth/github before using protected routes"
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid",
          description:
            "Session cookie set automatically after logging in at GET /auth/github"
        }
      }
    }
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// -------------------- Routes --------------------
app.use("/", require("./routes"));

// -------------------- 404 Handler --------------------
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// -------------------- celebrate Validation Errors --------------------
// celebrate wraps Joi errors; isCelebrateError identifies them so we can
// return the exact field-level messages produced by the Joi schema.
app.use((err, req, res, next) => {
  if (isCelebrateError(err)) {
    const [segment, joiError] = [...err.details.entries()][0];
    return res.status(400).json({
      error: "Validation error",
      segment,
      details: joiError.details.map((d) => d.message)
    });
  }
  next(err);
});

// -------------------- Global Error Handler --------------------
// http-errors attach a .status and set .expose = true when the message is
// safe to send to the client (4xx). For 5xx errors expose is false so we
// return a generic message instead of leaking internals.
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.expose ? err.message : "Internal server error";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
});

// -------------------- Start Server (after DB connects) --------------------
connectDb()
  .then(() => {
    // Passport strategy needs app.locals.db — configure after DB is ready
    configurePassport(app);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Swagger docs at ${baseUrl}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
    process.exit(1);
  });
