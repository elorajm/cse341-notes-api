require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", require("./routes"));

// Port
const port = process.env.PORT || 8080;

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notes API",
      version: "1.0.0",
      description: "CSE 341 Notes API"
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ["./routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Start server (no DB connection)
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs at http://localhost:${port}/api-docs`);
});
