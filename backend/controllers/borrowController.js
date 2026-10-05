const Book = require("../models/Book");
const Member = require("../models/Member");
const BorrowRecord = require("../models/BorrowRecord");

exports.borrowBook = async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    const error = new Error("Request body must be a JSON object");
    error.statusCode = 400;
    throw error;
  }

  const { bookId, memberId, dueDate } = req.body;
  if (!bookId || !memberId || !dueDate) {
    const error = new Error("bookId, memberId, and dueDate are required");
    error.statusCode = 400;
    throw error;
  }

  const parsedDueDate = new Date(dueDate);
  if (Number.isNaN(parsedDueDate.getTime())) {
    const error = new Error("dueDate must be a valid date");
    error.statusCode = 400;
    throw error;
  }

  const member = await Member.findById(memberId);
  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const book = await Book.findOneAndUpdate(
    { _id: bookId, availableCopies: { $gt: 0 } },
    { $inc: { availableCopies: -1 } },
    { new: true }
  );

  if (!book) {
    const existingBook = await Book.exists({ _id: bookId });
    const error = new Error(existingBook ? "No copies of this book are available" : "Book not found");
    error.statusCode = existingBook ? 409 : 404;
    throw error;
  }

  try {
    const record = await BorrowRecord.create({
      book: book._id,
      member: member._id,
      dueDate: parsedDueDate,
    });
    res.status(201).json(record);
  } catch (error) {
    await Book.updateOne({ _id: book._id }, { $inc: { availableCopies: 1 } });
    throw error;
  }
};

exports.returnBook = async (req, res) => {
  const record = await BorrowRecord.findOneAndUpdate(
    { _id: req.params.borrowId, status: "issued" },
    { $set: { returnDate: new Date(), status: "returned" } },
    { new: true }
  );

  if (!record) {
    const existingRecord = await BorrowRecord.findById(req.params.borrowId);
    const error = new Error(
      existingRecord ? "This borrow record has already been returned" : "Borrow record not found"
    );
    error.statusCode = existingRecord ? 409 : 404;
    throw error;
  }

  const inventoryUpdate = await Book.updateOne({ _id: record.book }, { $inc: { availableCopies: 1 } });
  if (inventoryUpdate.matchedCount !== 1) {
    await BorrowRecord.updateOne(
      { _id: record._id, status: "returned" },
      { $set: { returnDate: null, status: "issued" } }
    );
    const error = new Error("Book inventory could not be updated");
    error.statusCode = 500;
    throw error;
  }

  res.json(record);
};
