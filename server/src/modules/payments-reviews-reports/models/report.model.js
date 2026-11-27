const { sql, getPool } = require('../config/db');
const { TABLES } = require('../config/tableNames');

function applyDateRange(request, column, from, to) {
  const conditions = [];

  if (from) {
    request.input('fromDate', sql.Date, from);
    conditions.push(`${column} >= @fromDate`);
  }

  if (to) {
    request.input('toDate', sql.Date, to);
    conditions.push(`${column} < DATEADD(DAY, 1, @toDate)`);
  }

  return conditions;
}

async function getProjectActivity({ from, to }) {
  const pool = await getPool();

  const statusReq = pool.request();
  const statusConditions = applyDateRange(statusReq, 'p.CreatedAt', from, to);
  const statusWhere = statusConditions.length ? `WHERE ${statusConditions.join(' AND ')}` : '';

  const timelineReq = pool.request();
  const timelineConditions = applyDateRange(timelineReq, 'p.CreatedAt', from, to);
  const timelineWhere = timelineConditions.length
    ? `WHERE ${timelineConditions.join(' AND ')}`
    : '';

  const [byStatusRes, overTimeRes] = await Promise.all([
    statusReq.query(`
      SELECT
        p.Status,
        COUNT() AS ProjectCount
      FROM ${TABLES.PROJECTS} AS p
      ${statusWhere}
      GROUP BY p.Status
      ORDER BY ProjectCount DESC
    `),
    timelineReq.query(`
      SELECT
        CONVERT(CHAR(7), p.CreatedAt, 120) AS Month,
        COUNT() AS ProjectCount
      FROM ${TABLES.PROJECTS} AS p
      ${timelineWhere}
      GROUP BY CONVERT(CHAR(7), p.CreatedAt, 120)
      ORDER BY Month ASC
    `),
  ]);

  const byStatus = byStatusRes.recordset.map((row) => ({
    status: row.Status,
    count: Number(row.ProjectCount),
  }));

  const totalProjects = byStatus.reduce((sum, item) => sum + item.count, 0);

  return {
    totalProjects,
    byStatus,
    overTime: overTimeRes.recordset.map((row) => ({
      month: row.Month,
      count: Number(row.ProjectCount),
    })),
  };
}

async function getUserActivity({ from, to }) {
  const pool = await getPool();

  const freelancerReq = pool.request();
  const freelancerDateConds = applyDateRange(freelancerReq, 'a.AssignedAt', from, to);
  const freelancerJoinFilter = freelancerDateConds.length
    ? `AND ${freelancerDateConds.join(' AND ')}`
    : '';

  const clientReq = pool.request();
  const clientDateConds = applyDateRange(clientReq, 'p.CreatedAt', from, to);
  const clientJoinFilter = clientDateConds.length
    ? `AND ${clientDateConds.join(' AND ')}`
    : '';

  const proposalReq = pool.request();
  const proposalDateConds = applyDateRange(proposalReq, 'pr.SubmittedAt', from, to);
  const proposalWhere = proposalDateConds.length
    ? `WHERE ${proposalDateConds.join(' AND ')}`
    : '';

  const [topFreelancersRes, activeClientsRes, proposalsPerUserRes] = await Promise.all([
    freelancerReq.query(`
      SELECT TOP 10
        fp.UserID,
        fp.DisplayName,
        u.Email,
        COUNT(DISTINCT a.AssignmentID) AS TotalAssignments,
        COUNT(DISTINCT CASE WHEN a.Status = N'completed' THEN a.AssignmentID END) AS CompletedAssignments,
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'paid' THEN pay.Amount ELSE 0 END), 0) AS TotalEarned,
        dbo.fn_UserAverageRating(fp.UserID) AS AverageRating
      FROM ${TABLES.FREELANCER_PROFILES} AS fp
      INNER JOIN ${TABLES.USERS} AS u ON u.UserID = fp.UserID
      LEFT JOIN ${TABLES.ASSIGNMENTS} AS a
        ON a.FreelancerID = fp.UserID ${freelancerJoinFilter}
      LEFT JOIN ${TABLES.PAYMENTS} AS pay
        ON pay.AssignmentID = a.AssignmentID
      GROUP BY fp.UserID, fp.DisplayName, u.Email
      ORDER BY TotalEarned DESC, CompletedAssignments DESC, fp.DisplayName ASC
    `),
    clientReq.query(`
      SELECT TOP 10
        cp.UserID,
        cp.ContactName,
        cp.OrganizationName,
        u.Email,
        COUNT(DISTINCT p.ProjectID) AS ProjectsPosted,
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'paid' THEN pay.Amount ELSE 0 END), 0) AS TotalSpent
      FROM ${TABLES.CLIENT_PROFILES} AS cp
      INNER JOIN ${TABLES.USERS} AS u ON u.UserID = cp.UserID
      LEFT JOIN ${TABLES.PROJECTS} AS p
        ON p.ClientID = cp.UserID ${clientJoinFilter}
      LEFT JOIN ${TABLES.ASSIGNMENTS} AS a
        ON a.ProjectID = p.ProjectID
      LEFT JOIN ${TABLES.PAYMENTS} AS pay
        ON pay.AssignmentID = a.AssignmentID
      GROUP BY cp.UserID, cp.ContactName, cp.OrganizationName, u.Email
      ORDER BY ProjectsPosted DESC, TotalSpent DESC, cp.ContactName ASC
    `),
    proposalReq.query(`
      SELECT TOP 10
        fp.UserID,
        fp.DisplayName,
        COUNT(pr.ProposalID) AS TotalProposals,
        SUM(CASE WHEN pr.Status = N'accepted' THEN 1 ELSE 0 END) AS AcceptedProposals,
        SUM(CASE WHEN pr.Status = N'pending' THEN 1 ELSE 0 END) AS PendingProposals,
        SUM(CASE WHEN pr.Status = N'rejected' THEN 1 ELSE 0 END) AS RejectedProposals
      FROM ${TABLES.PROPOSALS} AS pr
      INNER JOIN ${TABLES.FREELANCER_PROFILES} AS fp ON fp.UserID = pr.FreelancerID
      ${proposalWhere}
      GROUP BY fp.UserID, fp.DisplayName
      ORDER BY TotalProposals DESC, AcceptedProposals DESC
    `),
  ]);

  return {
    topFreelancers: topFreelancersRes.recordset.map((row) => ({
      userId: Number(row.UserID),
      displayName: row.DisplayName,
      email: row.Email,
      totalAssignments: Number(row.TotalAssignments),
      completedAssignments: Number(row.CompletedAssignments),
      totalEarned: Number(row.TotalEarned),
      averageRating: row.AverageRating !== null ? Number(row.AverageRating) : null,
    })),
    mostActiveClients: activeClientsRes.recordset.map((row) => ({
      userId: Number(row.UserID),
      contactName: row.ContactName,
      organizationName: row.OrganizationName,
      email: row.Email,
      projectsPosted: Number(row.ProjectsPosted),
      totalSpent: Number(row.TotalSpent),
    })),
    proposalsPerUser: proposalsPerUserRes.recordset.map((row) => ({
      userId: Number(row.UserID),
      displayName: row.DisplayName,
      totalProposals: Number(row.TotalProposals),
      acceptedProposals: Number(row.AcceptedProposals),
      pendingProposals: Number(row.PendingProposals),
      rejectedProposals: Number(row.RejectedProposals),
    })),
  };
}

async function getSkillAndServiceDemand({ from, to }) {
  const pool = await getPool();

  const skillReq = pool.request();
  const skillConditions = applyDateRange(skillReq, 'p.CreatedAt', from, to);
  const skillWhere = skillConditions.length ? `WHERE ${skillConditions.join(' AND ')}` : '';

  const serviceReq = pool.request();
  const serviceConditions = applyDateRange(serviceReq, 'p.CreatedAt', from, to);
  const serviceWhere = serviceConditions.length
    ? `WHERE ${serviceConditions.join(' AND ')}`
    : '';

  const [skillsRes, servicesRes] = await Promise.all([
    skillReq.query(`
      SELECT TOP 10
        s.SkillID,
        s.SkillName,
        sc.CategoryName,
        COUNT(prs.ProjectID) AS RequestCount
      FROM ${TABLES.PROJECT_REQUIRED_SKILLS} AS prs
      INNER JOIN ${TABLES.AI_SKILLS} AS s ON s.SkillID = prs.SkillID
      INNER JOIN ${TABLES.SKILL_CATEGORIES} AS sc ON sc.SkillCategoryID = s.SkillCategoryID
      INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = prs.ProjectID
      ${skillWhere}
      GROUP BY s.SkillID, s.SkillName, sc.CategoryName
      ORDER BY RequestCount DESC, s.SkillName ASC
    `),
    serviceReq.query(`
      SELECT TOP 10
        sv.ServiceID,
        sv.ServiceName,
        sc.CategoryName,
        COUNT(prs.ProjectID) AS RequestCount
      FROM ${TABLES.PROJECT_REQUIRED_SERVICES} AS prs
      INNER JOIN ${TABLES.AI_SERVICES} AS sv ON sv.ServiceID = prs.ServiceID
      INNER JOIN ${TABLES.SERVICE_CATEGORIES} AS sc ON sc.ServiceCategoryID = sv.ServiceCategoryID
      INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = prs.ProjectID
      ${serviceWhere}
      GROUP BY sv.ServiceID, sv.ServiceName, sc.CategoryName
      ORDER BY RequestCount DESC, sv.ServiceName ASC
    `),
  ]);

  return {
    topSkills: skillsRes.recordset.map((row) => ({
      skillId: Number(row.SkillID),
      skillName: row.SkillName,
      categoryName: row.CategoryName,
      requestCount: Number(row.RequestCount),
    })),
    topServices: servicesRes.recordset.map((row) => ({
      serviceId: Number(row.ServiceID),
      serviceName: row.ServiceName,
      categoryName: row.CategoryName,
      requestCount: Number(row.RequestCount),
    })),
  };
}

async function getPaymentsAndRevenue({ from, to }) {
  const pool = await getPool();

  const summaryReq = pool.request();
  const summaryConds = applyDateRange(summaryReq, 'COALESCE(pay.PaidAt, pay.CreatedAt)', from, to);
  const summaryWhere = summaryConds.length ? `WHERE ${summaryConds.join(' AND ')}` : '';

  const monthlyReq = pool.request();
  const monthlyConds = [
    "pay.PaymentStatus = N'paid'",
    ...applyDateRange(monthlyReq, 'COALESCE(pay.PaidAt, pay.CreatedAt)', from, to),
  ];
  const monthlyWhere = `WHERE ${monthlyConds.join(' AND ')}`;

  const statusReq = pool.request();
  const statusConds = applyDateRange(statusReq, 'pay.CreatedAt', from, to);
  const statusWhere = statusConds.length ? `WHERE ${statusConds.join(' AND ')}` : '';

  const methodReq = pool.request();
  const methodConds = applyDateRange(methodReq, 'pay.CreatedAt', from, to);
  const methodWhere = methodConds.length ? `WHERE ${methodConds.join(' AND ')}` : '';

  const [summaryRes, monthlyRes, byStatusRes, byMethodRes] = await Promise.all([
    summaryReq.query(`
      SELECT
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'paid' THEN pay.Amount ELSE 0 END), 0) AS TotalRevenue,
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'pending' THEN pay.Amount ELSE 0 END), 0) AS PendingAmount,
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'refunded' THEN pay.Amount ELSE 0 END), 0) AS RefundedAmount,
        COALESCE(SUM(CASE WHEN pay.PaymentStatus = N'failed' THEN pay.Amount ELSE 0 END), 0) AS FailedAmount,
        COUNT() AS TotalTransactions
      FROM ${TABLES.PAYMENTS} AS pay
      ${summaryWhere}
    `),
    monthlyReq.query(`
      SELECT
        CONVERT(CHAR(7), COALESCE(pay.PaidAt, pay.CreatedAt), 120) AS Month,
        COALESCE(SUM(pay.Amount), 0) AS Revenue,
        COUNT() AS PaymentCount
      FROM ${TABLES.PAYMENTS} AS pay
      ${monthlyWhere}
      GROUP BY CONVERT(CHAR(7), COALESCE(pay.PaidAt, pay.CreatedAt), 120)
      ORDER BY Month ASC
    `),
    statusReq.query(`
      SELECT
        pay.PaymentStatus AS Status,
        COUNT() AS PaymentCount,
        COALESCE(SUM(pay.Amount), 0) AS TotalAmount
      FROM ${TABLES.PAYMENTS} AS pay
      ${statusWhere}
      GROUP BY pay.PaymentStatus
      ORDER BY TotalAmount DESC
    `),
    methodReq.query(`
      SELECT
        COALESCE(pay.PaymentMethod, N'unspecified') AS Method,
        COUNT() AS PaymentCount,
        COALESCE(SUM(pay.Amount), 0) AS TotalAmount
      FROM ${TABLES.PAYMENTS} AS pay
      ${methodWhere}
      GROUP BY COALESCE(pay.PaymentMethod, N'unspecified')
      ORDER BY TotalAmount DESC
    `),
  ]);

  const summaryRow = summaryRes.recordset[0] || {};

  return {
    summary: {
      totalRevenue: Number(summaryRow.TotalRevenue || 0),
      pendingAmount: Number(summaryRow.PendingAmount || 0),
      refundedAmount: Number(summaryRow.RefundedAmount || 0),
      failedAmount: Number(summaryRow.FailedAmount || 0),
      totalTransactions: Number(summaryRow.TotalTransactions || 0),
    },
    revenuePerMonth: monthlyRes.recordset.map((row) => ({
      month: row.Month,
      revenue: Number(row.Revenue),
      count: Number(row.PaymentCount),
    })),
    byStatus: byStatusRes.recordset.map((row) => ({
      status: row.Status,
      count: Number(row.PaymentCount),
      totalAmount: Number(row.TotalAmount),
    })),
    byMethod: byMethodRes.recordset.map((row) => ({
      method: row.Method,
      count: Number(row.PaymentCount),
      totalAmount: Number(row.TotalAmount),
    })),
  };
}

module.exports = {
  getProjectActivity,
  getUserActivity,
  getSkillAndServiceDemand,
  getPaymentsAndRevenue,
};