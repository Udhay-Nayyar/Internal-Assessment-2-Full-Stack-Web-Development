function validationError(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

function validate(check) {
  return function (req, res, next) {
    try {
      check(req);
      next();
    } catch (error) {
      next(error);
    }
  };
}

function requireObjectBody(req) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw validationError("Request body must be a JSON object");
  }
}

function requireNonEmptyString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw validationError(`${field} must be a non-empty string`);
  }
}

function requireObjectId(value, field) {
  if (typeof value !== "string" || !/^[a-f\d]{24}$/i.test(value)) {
    throw validationError(`${field} must be a valid ID`);
  }
}

exports.validateBook = validate((req) => {
  requireObjectBody(req);
  const { title, author, ISBN, genre, totalCopies, availableCopies } = req.body;

  requireNonEmptyString(title, "title");
  requireNonEmptyString(author, "author");
  requireNonEmptyString(ISBN, "ISBN");
  requireNonEmptyString(genre, "genre");

  if (!Number.isInteger(totalCopies) || totalCopies < 1) {
    throw validationError("totalCopies must be an integer greater than 0");
  }

  if (
    availableCopies !== undefined &&
    (!Number.isInteger(availableCopies) || availableCopies < 0 || availableCopies > totalCopies)
  ) {
    throw validationError("availableCopies must be an integer between 0 and totalCopies");
  }
});

exports.validateLogin = validate((req) => {
  requireObjectBody(req);
  requireNonEmptyString(req.body.username, "username");
  if (typeof req.body.password !== "string" || !req.body.password) {
    throw validationError("password must be a non-empty string");
  }
});

exports.validateMember = validate((req) => {
  requireObjectBody(req);
  const { name, email, membershipId } = req.body;

  requireNonEmptyString(name, "name");
  requireNonEmptyString(email, "email");
  requireNonEmptyString(membershipId, "membershipId");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw validationError("email must be a valid email address");
  }
});

exports.validateBookList = validate((req) => {
  for (const field of ["page", "limit"]) {
    if (req.query[field] !== undefined) {
      const value = req.query[field];
      if (
        typeof value !== "string" ||
        !/^[1-9]\d*$/.test(value) ||
        !Number.isSafeInteger(Number(value))
      ) {
        throw validationError(`${field} must be a positive integer`);
      }
    }
  }

  if (req.query.genre !== undefined) {
    requireNonEmptyString(req.query.genre, "genre");
  }
});

exports.validateBorrow = validate((req) => {
  requireObjectBody(req);
  const { bookId, memberId, dueDate } = req.body;

  requireObjectId(bookId, "bookId");
  requireObjectId(memberId, "memberId");

  if (!dueDate || typeof dueDate !== "string" || Number.isNaN(Date.parse(dueDate))) {
    throw validationError("dueDate must be a valid date");
  }
});

exports.validateMemberHistoryId = validate((req) => {
  requireObjectId(req.params.id, "Member ID");
});

exports.validateBorrowId = validate((req) => {
  requireObjectId(req.params.borrowId, "Borrow ID");
});
