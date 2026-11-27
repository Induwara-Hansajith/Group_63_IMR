const express = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const adminController = require('../controllers/admin.controller');
const { VALID_DISPUTE_STATUSES } = require('../services/admin.service');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('client', 'freelancer'),
  [
    body('projectId').isInt({ min: 1 }).withMessage('projectId must be a positive integer.'),
    body('subject')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('subject must be between 3 and 200 characters.'),
    body('description')
      .trim()
      .isLength({ min: 10 })
      .withMessage('description must be at least 10 characters.'),
  ],
  validateRequest,
  adminController.createDispute
);

router.get(
  '/me',
  authorizeRoles('client', 'freelancer'),
  [
    query('status')
      .optional()
      .isIn(VALID_DISPUTE_STATUSES)
      .withMessage(`status must be one of: ${VALID_DISPUTE_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  adminController.listMyDisputes
);

module.exports = router;