const request = require('supertest');
const { createTestApp, makeToken } = require('./testHelper');
const reviewModel = require('../models/review.model');

jest.mock('../models/review.model');

const app = createTestApp();

const clientToken = makeToken({ id: 10, role: 'client' });
const freelancerToken = makeToken({ id: 20, role: 'freelancer' });
const outsiderToken = makeToken({ id: 77, role: 'freelancer' });

describe('Reviews API (/api/reviews)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/reviews - allows client to review freelancer after completion', async () => {
    reviewModel.getProjectReviewContext.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
      ProjectStatus: 'completed',
    });
    reviewModel.findReviewByProjectAndReviewer.mockResolvedValue(null);
    reviewModel.createReview.mockResolvedValue({
      ReviewID: 1,
      ProjectID: 100,
      ReviewerID: 10,
      RevieweeID: 20,
      Rating: 5,
      Comment: 'Great AI model.',
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: 100, rating: 5, comment: 'Great AI model.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.RevieweeID).toBe(20);
  });

  test('POST /api/reviews - blocks review when project is not completed', async () => {
    reviewModel.getProjectReviewContext.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
      ProjectStatus: 'in_progress',
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: 100, rating: 4 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/completed/i);
  });

  test('POST /api/reviews - blocks duplicate review from same participant on same project', async () => {
    reviewModel.getProjectReviewContext.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
      ProjectStatus: 'completed',
    });
    reviewModel.findReviewByProjectAndReviewer.mockResolvedValue({
      ReviewID: 1,
      ProjectID: 100,
      ReviewerID: 10,
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: 100, rating: 5 });

    expect(res.statusCode).toBe(409);
  });

  test('POST /api/reviews - blocks non-participant from reviewing', async () => {
    reviewModel.getProjectReviewContext.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
      ProjectStatus: 'completed',
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ projectId: 100, rating: 5 });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/reviews - blocks self-review', async () => {
    reviewModel.getProjectReviewContext.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
      ProjectStatus: 'completed',
    });

    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({ projectId: 100, revieweeId: 20, rating: 5 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/yourself/i);
  });

  test('POST /api/reviews - rejects rating outside 1-5 range', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ projectId: 100, rating: 6 });

    expect(res.statusCode).toBe(400);
  });

  test('GET /api/reviews/user/:userId - returns reviews and average rating', async () => {
    reviewModel.getReviewsForUser.mockResolvedValue({
      userId: 20,
      averageRating: 4.5,
      totalReviews: 2,
      reviews: [],
    });

    const res = await request(app)
      .get('/api/reviews/user/20')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.averageRating).toBe(4.5);
  });
});