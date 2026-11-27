const AppError = require('../utils/AppError');
const reviewModel = require('../models/review.model');

async function submitReview(currentUser, { projectId, revieweeId, rating, comment }) {
  const context = await reviewModel.getProjectReviewContext(projectId);
  if (!context) {
    throw new AppError('Project not found.', 404);
  }

  if (context.ProjectStatus !== 'completed') {
    throw new AppError(
      `Reviews can only be submitted after the project is completed (current status: '${context.ProjectStatus}').`,
      400
    );
  }

  if (!context.FreelancerID) {
    throw new AppError('Cannot review a project with no assigned freelancer.', 400);
  }

  const reviewerId = Number(currentUser.id);
  const clientId = Number(context.ClientID);
  const freelancerId = Number(context.FreelancerID);

  let expectedRevieweeId = null;
  if (reviewerId === clientId) {
    expectedRevieweeId = freelancerId;
  } else if (reviewerId === freelancerId) {
    expectedRevieweeId = clientId;
  } else {
    throw new AppError(
      'You must be a participant of this project to submit a review.',
      403
    );
  }

  const targetRevieweeId = revieweeId ? Number(revieweeId) : expectedRevieweeId;

  if (targetRevieweeId === reviewerId) {
    throw new AppError('You cannot submit a review for yourself.', 400);
  }

  if (targetRevieweeId !== expectedRevieweeId) {
    throw new AppError(
      'You can only review the other participant (client or assigned freelancer) of this project.',
      400
    );
  }

  const existing = await reviewModel.findReviewByProjectAndReviewer(projectId, reviewerId);
  if (existing) {
    throw new AppError('You have already submitted a review for this project.', 409);
  }

  return reviewModel.createReview({
    projectId: Number(projectId),
    reviewerId,
    revieweeId: targetRevieweeId,
    rating: Number(rating),
    comment: comment ? comment.trim() : null,
  });
}

async function listUserReviews(userId) {
  return reviewModel.getReviewsForUser(userId);
}

async function listProjectReviews(projectId) {
  const context = await reviewModel.getProjectReviewContext(projectId);
  if (!context) {
    throw new AppError('Project not found.', 404);
  }
  return reviewModel.getReviewsForProject(projectId);
}

async function listMyReviews(currentUser) {
  const [receivedSummary, given] = await Promise.all([
    reviewModel.getReviewsForUser(currentUser.id),
    reviewModel.getReviewsByReviewer(currentUser.id),
  ]);

  return {
    averageRating: receivedSummary.averageRating,
    totalReceived: receivedSummary.totalReviews,
    received: receivedSummary.reviews,
    given,
  };
}

module.exports = {
  submitReview,
  listUserReviews,
  listProjectReviews,
  listMyReviews,
};