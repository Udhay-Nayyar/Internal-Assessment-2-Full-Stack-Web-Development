const Book = require("../models/Book");

exports.createBook = async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    const error = new Error("Request body must be a JSON object");
    error.statusCode = 400;
    throw error;
  }

  const bookData = { ...req.body };
  if (bookData.availableCopies === undefined && bookData.totalCopies !== undefined) {
    bookData.availableCopies = bookData.totalCopies;
  }

  const book = await Book.create(bookData);
  res.status(201).json(book);
};

exports.listBooks = async (req, res) => {
  const page = Number(req.query.page === undefined ? 1 : req.query.page);
  const limit = Number(req.query.limit === undefined ? 10 : req.query.limit);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    const error = new Error("page and limit must be positive integers");
    error.statusCode = 400;
    throw error;
  }

  const filter = {};
  if (req.query.genre !== undefined) {
    if (typeof req.query.genre !== "string" || !req.query.genre.trim()) {
      const error = new Error("genre must be a non-empty string");
      error.statusCode = 400;
      throw error;
    }
    filter.genre = req.query.genre.trim();
  }

  const pageSize = Math.min(limit, 100);
  const [books, total] = await Promise.all([
    Book.find(filter)
      .sort({ title: 1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Book.countDocuments(filter),
  ]);

  res.json({
    books,
    pagination: {
      page,
      limit: pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
};
