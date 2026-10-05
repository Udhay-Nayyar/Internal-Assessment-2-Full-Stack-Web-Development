const Member = require("../models/Member");
const BorrowRecord = require("../models/BorrowRecord");

exports.createMember = async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    const error = new Error("Request body must be a JSON object");
    error.statusCode = 400;
    throw error;
  }

  const member = await Member.create(req.body);
  res.status(201).json(member);
};

exports.getMemberHistory = async (req, res) => {
  const member = await Member.findById(req.params.id);
  if (!member) {
    const error = new Error("Member not found");
    error.statusCode = 404;
    throw error;
  }

  const history = await BorrowRecord.find({ member: member._id })
    .populate("book")
    .sort({ issueDate: -1 });

    const members = await Member.find().sort({ name: 1 });
  res.json({ members , member, history });
};


exports.listMembers = async (req, res) => {
  const members = await Member.find().sort({ name: 1 });
  res.json({ members });
};