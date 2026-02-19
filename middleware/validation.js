const { body, param, validationResult } = require("express-validator");
const { celebrate, Joi, Segments } = require("celebrate");

// ── express-validator ──────────────────────────────────────────────────────
// Reads the result collected by previous param()/body() checks and responds
// with 400 + an array of error messages if anything failed.
const checkResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validates that :id is a 24-character hex MongoDB ObjectId.
const validateId = [
  param("id")
    .isMongoId()
    .withMessage("id must be a valid 24-character hex ObjectId"),
  checkResult
];

// Validates the request body for note create / update.
// title and content are required; summary, tags, isPinned are optional.
const validateNoteBody = [
  body("title")
    .notEmpty()
    .withMessage("title is required")
    .isString()
    .withMessage("title must be a string")
    .isLength({ max: 100 })
    .withMessage("title must be 100 characters or fewer"),
  body("content")
    .notEmpty()
    .withMessage("content is required")
    .isString()
    .withMessage("content must be a string"),
  body("summary")
    .optional()
    .isString()
    .withMessage("summary must be a string")
    .isLength({ max: 200 })
    .withMessage("summary must be 200 characters or fewer"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("tags must be an array")
    .custom((arr) => arr.every((t) => typeof t === "string"))
    .withMessage("each tag must be a string"),
  body("isPinned")
    .optional()
    .isBoolean()
    .withMessage("isPinned must be a boolean"),
  checkResult
];

// Validates the request body for manual user creation.
const validateUserBody = [
  body("githubId")
    .notEmpty()
    .withMessage("githubId is required")
    .isString()
    .withMessage("githubId must be a string"),
  body("username")
    .notEmpty()
    .withMessage("username is required")
    .isString()
    .withMessage("username must be a string"),
  body("displayName").optional().isString().withMessage("displayName must be a string"),
  body("email").optional().isEmail().withMessage("email must be a valid email address"),
  body("avatarUrl").optional().isURL().withMessage("avatarUrl must be a valid URL"),
  body("profileUrl").optional().isURL().withMessage("profileUrl must be a valid URL"),
  checkResult
];

// ── celebrate / Joi ────────────────────────────────────────────────────────
// celebrate wraps a Joi schema and turns validation failures into errors that
// the celebrate errors() middleware (registered in server.js) formats for you.
// Swap these into the routes in place of the express-validator arrays above.

const celebrateId = celebrate({
  [Segments.PARAMS]: Joi.object({
    id: Joi.string()
      .length(24)
      .hex()
      .required()
      .messages({
        "string.length": "id must be a 24-character hex ObjectId",
        "string.hex": "id must be a valid hex value",
        "any.required": "id is required"
      })
  })
});

const celebrateNoteBody = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(1).max(100).required().messages({
      "string.empty": "title is required",
      "string.max": "title must be 100 characters or fewer",
      "any.required": "title is required"
    }),
    content: Joi.string().min(1).required().messages({
      "string.empty": "content is required",
      "any.required": "content is required"
    }),
    summary: Joi.string().max(200).optional().allow("", null),
    tags: Joi.array().items(Joi.string()).optional(),
    isPinned: Joi.boolean().optional()
  })
});

module.exports = {
  // express-validator chains (currently used in routes)
  validateId,
  validateNoteBody,
  validateUserBody,
  // celebrate / Joi alternatives
  celebrateId,
  celebrateNoteBody
};
