const reviewService = require('../services/review.service');
const { sendResponse } = require('../utils/response');

async function createReview(req, res, next) {
  try {
    const review = await reviewService.submitReview(req.user, req.body);
    return sendResponse(res, 201, 'Review submitted successfully.', review);
  } catch (err) {
    return next(err);
  }
}

async function getMyReviews(req, res, next) {
  try {
    const data = await reviewService.listMyReviews(req.user);
    return sendResponse(res, 200, 'Your reviews retrieved successfully.', data);
  } catch (err) {
    return next(err);
  }
}

async function getReviewsByUser(req, res, next) {
  try {
    const data = await reviewService.listUserReviews(Number(req.params.userId));
    return sendResponse(res, 200, 'User reviews retrieved successfully.', data);
  } catch (err) {
    return next(err);
  }
}

async function getReviewsByProject(req, res, next) {
  try {
    const data = await reviewService.listProjectReviews(Number(req.params.projectId));
    return sendResponse(res, 200, 'Project reviews retrieved successfully.', data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  createReview,
  getMyReviews,
  getReviewsByUser,
  getReviewsByProject,
};