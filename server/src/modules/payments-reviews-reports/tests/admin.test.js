const request = require('supertest');
const { createTestApp, makeToken } = require('./testHelper');
const adminModel = require('../models/admin.model');

jest.mock('../models/admin.model');

const app = createTestApp();

const adminToken = makeToken({ id: 1, role: 'admin' });
const clientToken = makeToken({ id: 10, role: 'client' });
const outsiderToken = makeToken({ id: 77, role: 'freelancer' });

describe('Admin & Disputes API (/api/admin & /api/disputes)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/admin/users - forbids non-admin users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${clientToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/admin/users/:userId/status - admin suspends a user account', async () => {
    adminModel.findUserById.mockResolvedValue({
      UserID: '10',
      Email: 'client@test.com',
      AccountStatus: 'active',
    });
    adminModel.updateUserAccountStatus.mockResolvedValue({
      UserID: 10,
      AccountStatus: 'suspended',
    });

    const res = await request(app)
      .patch('/api/admin/users/10/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'suspended' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.AccountStatus).toBe('suspended');
  });

  test('PATCH /api/admin/users/:userId/status - blocks admin from suspending self', async () => {
    adminModel.findUserById.mockResolvedValue({
      UserID: '1',
      AccountStatus: 'active',
    });

    const res = await request(app)
      .patch('/api/admin/users/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'suspended' });

    expect(res.statusCode).toBe(400);
  });

  test('POST /api/admin/skill-categories - admin creates category', async () => {
    adminModel.createSkillCategory.mockResolvedValue({
      SkillCategoryID: 5,
      CategoryName: 'Reinforcement Learning',
    });

    const res = await request(app)
      .post('/api/admin/skill-categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryName: 'Reinforcement Learning' });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.CategoryName).toBe('Reinforcement Learning');
  });

  test('POST /api/disputes - participant files a dispute', async () => {
    adminModel.getProjectParticipants.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
    });
    adminModel.createDispute.mockResolvedValue({
      DisputeID: 1,
      ProjectID: 100,
      RaisedByUserID: 10,
      Status: 'open',
    });

    const res = await request(app)
      .post('/api/disputes')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({
        projectId: 100,
        subject: 'Late delivery',
        description: 'Deliverable missed agreed milestone by 5 days.',
      });

    expect(res.statusCode).toBe(201);
  });

  test('POST /api/disputes - blocks non-participant from filing dispute', async () => {
    adminModel.getProjectParticipants.mockResolvedValue({
      ProjectID: '100',
      ClientID: '10',
      FreelancerID: '20',
    });

    const res = await request(app)
      .post('/api/disputes')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({
        projectId: 100,
        subject: 'Not my project',
        description: 'Trying to file a dispute on an unrelated project.',
      });

    expect(res.statusCode).toBe(403);
  });

  test('PATCH /api/admin/disputes/:disputeId/status - admin resolves a dispute', async () => {
    adminModel.findDisputeById.mockResolvedValue({
      DisputeID: '1',
      Status: 'open',
    });
    adminModel.updateDisputeStatus.mockResolvedValue({
      DisputeID: 1,
      Status: 'resolved',
      ResolvedAt: '2026-11-27T10:00:00.000Z',
    });

    const res = await request(app)
      .patch('/api/admin/disputes/1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'resolved' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.Status).toBe('resolved');
  });
});