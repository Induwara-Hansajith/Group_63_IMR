const express = require('express');
const { body, param, query } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const paymentController = require('../controllers/payment.controller');
const { VALID_METHODS, VALID_STATUSES } = require('../services/payment.service');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('client', 'admin'),
  [
    body('projectId').isInt({ min: 1 }).withMessage('projectId must be a positive integer.'),
    body('assignmentId').isInt({ min: 1 }).withMessage('assignmentId must be a positive integer.'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than 0.'),
    body('paymentMethod')
      .isIn(VALID_METHODS)
      .withMessage(`paymentMethod must be one of: ${VALID_METHODS.join(', ')}.`),
    body('paymentStatus')
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(`paymentStatus must be one of: ${VALID_STATUSES.join(', ')}.`),
    body('currencyCode')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('currencyCode must be a 3-letter ISO code (e.g. USD).'),
    body('transactionRef')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 200 })
      .withMessage('transactionRef must be 200 characters or fewer.'),
  ],
  validateRequest,
  paymentController.createPayment
);

router.get(
  '/',
  authorizeRoles('client', 'freelancer', 'admin', 'manager'),
  [
    query('status')
      .optional()
      .isIn(VALID_STATUSES)
      .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}.`),
    query('projectId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('projectId must be a positive integer.'),
  ],
  validateRequest,
  paymentController.listPayments
);

router.get(
  '/:id',
  authorizeRoles('client', 'freelancer', 'admin', 'manager'),
  [param('id').isInt({ min: 1 }).withMessage('Payment ID must be a positive integer.')],
  validateRequest,
  paymentController.getPaymentById
);

router.patch(
  '/:id/status',
  authorizeRoles('client', 'admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('Payment ID must be a positive integer.'),
    body('status')
      .isIn(VALID_STATUSES)
      .withMessage(`status must be one of: ${VALID_STATUSES.join(', ')}.`),
  ],
  validateRequest,
  paymentController.updatePaymentStatus
);

module.exports = router;