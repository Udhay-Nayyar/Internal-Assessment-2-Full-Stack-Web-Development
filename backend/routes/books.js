const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const {
  validateBook,
  validateBookList,
} = require("../middleware/validateRequest");
const authenticateLibrarian = require("../middleware/authenticateLibrarian");
const booksController = require("../controllers/booksController");

const router = express.Router();

router.post(
  "/",
  authenticateLibrarian,
  validateBook,
  asyncHandler(booksController.createBook)
);
router.get("/", validateBookList, asyncHandler(booksController.listBooks));

module.exports = router;
