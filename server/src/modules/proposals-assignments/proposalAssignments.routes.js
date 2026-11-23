const express = require("express");
const requireAuth = require("../../middleware/requireAuth");
const controller = require("./proposalAssignments.controller");
const router = express.Router();

router.use(requireAuth);

router.post("/proposals", controller.submitProposalHandler);
router.get("/proposals/my", controller.getMyProposalsHandler);
router.get("/proposals/project/:projectId", controller.getProjectProposalsHandler);
router.patch("/proposals/:proposalId/withdraw", controller.withdrawProposalHandler);
router.patch("/proposals/:proposalId/reject", controller.rejectProposalHandler);
router.post("/proposals/:proposalId/accept", controller.acceptProposalHandler);

router.get("/assignments/my", controller.getMyAssignmentsHandler);
router.get("/assignments/:assignmentId", controller.getAssignmentByIdHandler);
router.patch("/assignments/:assignmentId/status",controller.updateAssignmentStatusHandler);

module.exports = router;
