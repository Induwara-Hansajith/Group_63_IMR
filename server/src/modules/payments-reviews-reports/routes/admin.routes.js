const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const adminController = require('../controllers/admin.controller');
const {
  VALID_ACCOUNT_STATUSES,
  VALID_DISPUTE_STATUSES,
} = require('../services/admin.service');

const router = express.Router();

router.use(authenticate, authorizeRoles('admin'));

router.get(
  '/users',
  [
    query('role')
      .optional()
      .isIn(['freelancer', 'client', 'admin', 'manager'])
      .withMessage('Invalid role filter.'),
    query('status')
      .optional()
      .isIn(VALID_ACCOUNT_STATUSES)
      .withMessage(`status must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  adminController.listUsers
);

router.patch(
  '/users/:userId/status',
  [
    param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer.'),
    body('status')
      .isIn(VALID_ACCOUNT_STATUSES)
      .withMessage(`status must be one of: ${VALID_ACCOUNT_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  adminController.updateUserStatus
);

router.get('/skill-categories', adminController.listSkillCategories);

router.post(
  '/skill-categories',
  [
    body('categoryName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('categoryName must be between 2 and 100 characters.'),
  ],
  validateRequest,
  adminController.createSkillCategory
);

router.put(
  '/skill-categories/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Category ID must be a positive integer.'),
    body('categoryName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('categoryName must be between 2 and 100 characters.'),
  ],
  validateRequest,
  adminController.updateSkillCategory
);

router.delete(
  '/skill-categories/:id',
  [param('id').isInt({ min: 1 }).withMessage('Category ID must be a positive integer.')],
  validateRequest,
  adminController.deleteSkillCategory
);

router.get('/service-categories', adminController.listServiceCategories);

router.post(
  '/service-categories',
  [
    body('categoryName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('categoryName must be between 2 and 100 characters.'),
  ],
  validateRequest,
  adminController.createServiceCategory
);

router.put(
  '/service-categories/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Category ID must be a positive integer.'),
    body('categoryName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('categoryName must be between 2 and 100 characters.'),
  ],
  validateRequest,
  adminController.updateServiceCategory
);

router.delete(
  '/service-categories/:id',
  [param('id').isInt({ min: 1 }).withMessage('Category ID must be a positive integer.')],
  validateRequest,
  adminController.deleteServiceCategory
);

router.get(
  '/disputes',
  [
    query('status')
      .optional()
      .isIn(VALID_DISPUTE_STATUSES)
      .withMessage(`status must be one of: ${VALID_DISPUTE_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  adminController.listAllDisputes
);

router.patch(
  '/disputes/:disputeId/status',
  [
    param('disputeId').isInt({ min: 1 }).withMessage('disputeId must be a positive integer.'),
    body('status')
      .isIn(VALID_DISPUTE_STATUSES)
      .withMessage(`status must be one of: ${VALID_DISPUTE_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  adminController.updateDisputeStatus
);

module.exports = router;