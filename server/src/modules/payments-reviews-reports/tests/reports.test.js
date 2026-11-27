const request = require('supertest');
const { createTestApp, makeToken } = require('./testHelper');
const reportModel = require('../models/report.model');

jest.mock('../models/report.model');

const app = createTestApp();

const managerToken = makeToken({ id: 2, role: 'manager' });
const adminToken = makeToken({ id: 1, role: 'admin' });
const freelancerToken = makeToken({ id: 20, role: 'freelancer' });

describe('Manager Reports API (/api/reports)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/reports/revenue - forbids freelancer/client access', async () => {
    const res = await request(app)
      .get('/api/reports/revenue')
      .set('Authorization', `Bearer ${freelancerToken}`);

    expect(res.statusCode).toBe(403);
  });

  test('GET /api/reports/revenue - allows manager with valid date filters', async () => {
    reportModel.getPaymentsAndRevenue.mockResolvedValue({
      summary: { totalRevenue: 5200, pendingAmount: 1300, totalTransactions: 4 },
      revenuePerMonth: [{ month: '2026-09', revenue: 3700, count: 2 }],
      byStatus: [],
      byMethod: [],
    });

    const res = await request(app)
      .get('/api/reports/revenue?from=2026-08-01&to=2026-11-30')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.summary.totalRevenue).toBe(5200);
    expect(reportModel.getPaymentsAndRevenue).toHaveBeenCalledWith({
      from: '2026-08-01',
      to: '2026-11-30',
    });
  });

  test('GET /api/reports/project-activity - rejects when from > to', async () => {
    const res = await request(app)
      .get('/api/reports/project-activity?from=2026-12-01&to=2026-08-01')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/cannot be later/i);
  });

  test('GET /api/reports/skill-service-demand - returns top skills and services', async () => {
    reportModel.getSkillAndServiceDemand.mockResolvedValue({
      topSkills: [{ skillName: 'PyTorch', requestCount: 3 }],
      topServices: [{ serviceName: 'Custom Predictive Model', requestCount: 2 }],
    });

    const res = await request(app)
      .get('/api/reports/skill-service-demand')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.topSkills[0].skillName).toBe('PyTorch');
  });

  test('GET /api/reports/user-activity - returns top freelancers and active clients', async () => {
    reportModel.getUserActivity.mockResolvedValue({
      topFreelancers: [],
      mostActiveClients: [],
      proposalsPerUser: [],
    });

    const res = await request(app)
      .get('/api/reports/user-activity')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});