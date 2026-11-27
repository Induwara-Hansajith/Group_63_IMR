const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');
const { validateRequest } = require('../middleware/validate.middleware');
const reviewController = require('../controllers/review.controller');

const router = express.Router();

router.use(authenticate);

router.post(
  '/',
  authorizeRoles('client', 'freelancer'),
  [
    body('projectId').isInt({ min: 1 }).withMessage('projectId must be a positive integer.'),
    body('revieweeId')
      .optional()
      .isInt({ min: 1 })
      .withMessage('revieweeId must be a positive integer.'),
    body('rating')
      .isInt({ min: 1, max: 5 })
      .withMessage('rating must be an integer between 1 and 5.'),
    body('comment')
      .optional({ nullable: true })
      .isString()
      .isLength({ max: 2000 })
      .withMessage('comment must be 2000 characters or fewer.'),
  ],
  validateRequest,
  reviewController.createReview
);

router.get(
  '/me',
  authorizeRoles('client', 'freelancer', 'admin', 'manager'),
  reviewController.getMyReviews
);

router.get(
  '/user/:userId',
  authorizeRoles('client', 'freelancer', 'admin', 'manager'),
  [param('userId').isInt({ min: 1 }).withMessage('userId must be a positive integer.')],
  validateRequest,
  reviewController.getReviewsByUser
);

router.get(
  '/project/:projectId',
  authorizeRoles('client', 'freelancer', 'admin', 'manager'),
  [param('projectId').isInt({ min: 1 }).withMessage('projectId must be a positive integer.')],
  validateRequest,
  reviewController.getReviewsByProject
);

module.exports = router;