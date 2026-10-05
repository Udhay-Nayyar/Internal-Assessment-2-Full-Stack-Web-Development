const express = require("express");
const asyncHandler = require("../middleware/asyncHandler");
const {
  validateMember,
  validateMemberHistoryId,
} = require("../middleware/validateRequest");
const membersController = require("../controllers/membersController");

const router = express.Router();

router.get("/", asyncHandler(membersController.listMembers));
router.post("/", validateMember, asyncHandler(membersController.createMember));
router.get(
  "/:id/history",
  validateMemberHistoryId,
  asyncHandler(membersController.getMemberHistory)
);

module.exports = router;