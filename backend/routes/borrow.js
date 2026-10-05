const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticateLibrarian = require("../middleware/authenticateLibrarian");
const { validateBorrow } = require("../middleware/validateRequest");
const borrowController = require("../controllers/borrowController");

const router = express.Router();

router.post(
  "/",
  authenticateLibrarian,
  validateBorrow,
  asyncHandler(borrowController.borrowBook)
);

module.exports = router;
