const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const authenticateLibrarian = require("../middleware/authenticateLibrarian");
const { validateBorrowId } = require("../middleware/validateRequest");
const borrowController = require("../controllers/borrowController");

const router = express.Router();

router.post(
  "/:borrowId",
  authenticateLibrarian,
  validateBorrowId,
  asyncHandler(borrowController.returnBook)
);

module.exports = router;
