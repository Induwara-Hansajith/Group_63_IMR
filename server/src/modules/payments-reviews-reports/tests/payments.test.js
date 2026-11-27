const request = require('supertest');
const { createTestApp, makeToken } = require('./testHelper');
const paymentModel = require('../models/payment.model');

jest.mock('../models/payment.model');

const app = createTestApp();

const clientToken = makeToken({ id: 10, role: 'client' });
const otherClientToken = makeToken({ id: 99, role: 'client' });
const freelancerToken = makeToken({ id: 20, role: 'freelancer' });
const adminToken = makeToken({ id: 1, role: 'admin' });

describe('Payments API (/api/payments)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/payments - client records valid payment for assigned project', async () => {
    paymentModel.getAssignmentContext.mockResolvedValue({
      AssignmentID: '5',
      ProjectID: '100',
      FreelancerID: '20',
      AssignmentStatus: 'in_progress',
      ClientID: '10',
      AgreedPrice: 2000,
      AgreedCurrency: 'USD',
    });
    paymentModel.getActivePaidTotalForAssignment.mockResolvedValue(500);
    paymentModel.createPayment.mockResolvedValue({
      PaymentID: 1,
      AssignmentID: 5,
      Amount: 1000,
      PaymentStatus: 'pending',
      PaymentMethod: 'card',
    });

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 1000,
        paymentMethod: 'card',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.Amount).toBe(1000);
  });

  test('POST /api/payments - rejects amount <= 0', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 0,
        paymentMethod: 'card',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/payments - rejects invalid payment method', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 200,
        paymentMethod: 'crypto',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test('POST /api/payments - rejects if assignment does not exist', async () => {
    paymentModel.getAssignmentContext.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 999,
        amount: 500,
        paymentMethod: 'paypal',
      });

    expect(res.statusCode).toBe(404);
  });

  test('POST /api/payments - rejects if assignment belongs to a different project', async () => {
    paymentModel.getAssignmentContext.mockResolvedValue({
      AssignmentID: '5',
      ProjectID: '200',
      ClientID: '10',
      AssignmentStatus: 'assigned',
      AgreedPrice: 2000,
    });

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 500,
        paymentMethod: 'card',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/does not belong/i);
  });

  test('POST /api/payments - rejects client paying for another client project', async () => {
    paymentModel.getAssignmentContext.mockResolvedValue({
      AssignmentID: '5',
      ProjectID: '100',
      ClientID: '10',
      AssignmentStatus: 'in_progress',
      AgreedPrice: 2000,
    });

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${otherClientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 500,
        paymentMethod: 'card',
      });

    expect(res.statusCode).toBe(403);
  });

  test('POST /api/payments - rejects payment exceeding agreed price', async () => {
    paymentModel.getAssignmentContext.mockResolvedValue({
      AssignmentID: '5',
      ProjectID: '100',
      ClientID: '10',
      AssignmentStatus: 'in_progress',
      AgreedPrice: 1500,
    });
    paymentModel.getActivePaidTotalForAssignment.mockResolvedValue(1200);

    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 500,
        paymentMethod: 'bank_transfer',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/exceeds agreed price/i);
  });

  test('POST /api/payments - forbids freelancer from creating a payment', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${freelancerToken}`)
      .send({
        projectId: 100,
        assignmentId: 5,
        amount: 500,
        paymentMethod: 'card',
      });

    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/payments/:id/status - blocks invalid transition (refunded -> paid)', async () => {
    paymentModel.findPaymentById.mockResolvedValue({
      PaymentID: '1',
      ClientID: '10',
      PaymentStatus: 'refunded',
    });

    const res = await request(app)
      .patch('/api/payments/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'paid' });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/invalid status transition/i);
  });

  test('PATCH /api/payments/:id/status - blocks non-admin from issuing a refund', async () => {
    paymentModel.findPaymentById.mockResolvedValue({
      PaymentID: '1',
      ClientID: '10',
      PaymentStatus: 'paid',
    });

    const res = await request(app)
      .patch('/api/payments/1/status')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'refunded' });

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/payments/:id - blocks unrelated user from viewing payment', async () => {
    paymentModel.findPaymentById.mockResolvedValue({
      PaymentID: '1',
      ClientID: '10',
      FreelancerID: '20',
    });

    const res = await request(app)
      .get('/api/payments/1')
      .set('Authorization', `Bearer ${otherClientToken}`);

    expect(res.statusCode).toBe(403);
  });
});