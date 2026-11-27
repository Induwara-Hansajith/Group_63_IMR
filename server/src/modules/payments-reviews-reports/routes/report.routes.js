const express = require('express');
const { query } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const reportController = require('../controllers/report.controller');

const router = express.Router();

const dateFilterValidators = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('from must be a valid ISO date (YYYY-MM-DD).'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('to must be a valid ISO date (YYYY-MM-DD).'),
];

router.use(authenticate, authorizeRoles('admin', 'manager'));

router.get(
  '/project-activity',
  dateFilterValidators,
  validateRequest,
  reportController.getProjectActivity
);

router.get(
  '/user-activity',
  dateFilterValidators,
  validateRequest,
  reportController.getUserActivity
);

router.get(
  '/skill-service-demand',
  dateFilterValidators,
  validateRequest,
  reportController.getSkillServiceDemand
);

router.get(
  '/revenue',
  dateFilterValidators,
  validateRequest,
  reportController.getRevenue
);

module.exports = router;