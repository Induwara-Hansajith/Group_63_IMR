const { sql, getPool } = require('../config/db');
const { TABLES } = require('../config/tableNames');

async function getAssignmentContext(assignmentId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('assignmentId', sql.BigInt, assignmentId)
    .query(`
      SELECT
        a.AssignmentID,
        a.ProjectID,
        a.FreelancerID,
        a.Status AS AssignmentStatus,
        p.ClientID,
        p.Title AS ProjectTitle,
        p.Status AS ProjectStatus,
        pr.ProposedAmount AS AgreedPrice,
        pr.CurrencyCode AS AgreedCurrency
      FROM ${TABLES.ASSIGNMENTS} AS a
      INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = a.ProjectID
      INNER JOIN ${TABLES.PROPOSALS} AS pr ON pr.ProposalID = a.ProposalID
      WHERE a.AssignmentID = @assignmentId
    `);

  return result.recordset[0] || null;
}

async function getActivePaidTotalForAssignment(assignmentId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('assignmentId', sql.BigInt, assignmentId)
    .query(`
      SELECT COALESCE(SUM(Amount), 0) AS TotalCommitted
      FROM ${TABLES.PAYMENTS}
      WHERE AssignmentID = @assignmentId
        AND PaymentStatus IN (N'pending', N'paid')
    `);

  return Number(result.recordset[0].TotalCommitted);
}

async function createPayment({
  assignmentId,
  amount,
  currencyCode,
  paymentStatus,
  paymentMethod,
  transactionRef,
  paidAt,
}) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('assignmentId', sql.BigInt, assignmentId)
    .input('amount', sql.Decimal(12, 2), amount)
    .input('currencyCode', sql.Char(3), currencyCode)
    .input('paymentStatus', sql.NVarChar(20), paymentStatus)
    .input('paymentMethod', sql.NVarChar(40), paymentMethod)
    .input('transactionRef', sql.NVarChar(200), transactionRef || null)
    .input('paidAt', sql.DateTime2, paidAt || null)
    .query(`
      INSERT INTO ${TABLES.PAYMENTS}
        (AssignmentID, Amount, CurrencyCode, PaymentStatus, PaymentMethod, TransactionRef, PaidAt)
      OUTPUT INSERTED.
      VALUES
        (@assignmentId, @amount, @currencyCode, @paymentStatus, @paymentMethod, @transactionRef, @paidAt)
    `);

  return result.recordset[0];
}

async function findPaymentById(paymentId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('paymentId', sql.BigInt, paymentId)
    .query(`
      SELECT
        pay.PaymentID,
        pay.AssignmentID,
        a.ProjectID,
        p.Title AS ProjectTitle,
        p.ClientID,
        a.FreelancerID,
        pay.Amount,
        pay.CurrencyCode,
        pay.PaymentStatus,
        pay.PaymentMethod,
        pay.TransactionRef,
        pay.CreatedAt,
        pay.PaidAt
      FROM ${TABLES.PAYMENTS} AS pay
      INNER JOIN ${TABLES.ASSIGNMENTS} AS a ON a.AssignmentID = pay.AssignmentID
      INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = a.ProjectID
      WHERE pay.PaymentID = @paymentId
    `);

  return result.recordset[0] || null;
}

async function listPayments({ userId, role, status, projectId }) {
  const pool = await getPool();
  const request = pool.request();
  const conditions = [];

  if (role === 'client') {
    request.input('userId', sql.BigInt, userId);
    conditions.push('p.ClientID = @userId');
  } else if (role === 'freelancer') {
    request.input('userId', sql.BigInt, userId);
    conditions.push('a.FreelancerID = @userId');
  }

  if (status) {
    request.input('status', sql.NVarChar(20), status);
    conditions.push('pay.PaymentStatus = @status');
  }

  if (projectId) {
    request.input('projectId', sql.BigInt, projectId);
    conditions.push('a.ProjectID = @projectId');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await request.query(`
    SELECT
      pay.PaymentID,
      pay.AssignmentID,
      a.ProjectID,
      p.Title AS ProjectTitle,
      p.ClientID,
      a.FreelancerID,
      pay.Amount,
      pay.CurrencyCode,
      pay.PaymentStatus,
      pay.PaymentMethod,
      pay.TransactionRef,
      pay.CreatedAt,
      pay.PaidAt
    FROM ${TABLES.PAYMENTS} AS pay
    INNER JOIN ${TABLES.ASSIGNMENTS} AS a ON a.AssignmentID = pay.AssignmentID
    INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = a.ProjectID
    ${whereClause}
    ORDER BY pay.CreatedAt DESC
  `);

  return result.recordset;
}

async function updatePaymentStatus(paymentId, newStatus) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('paymentId', sql.BigInt, paymentId)
    .input('newStatus', sql.NVarChar(20), newStatus)
    .query(`
      UPDATE ${TABLES.PAYMENTS}
      SET
        PaymentStatus = @newStatus,
        PaidAt = CASE
          WHEN @newStatus = N'paid' AND PaidAt IS NULL THEN SYSUTCDATETIME()
          ELSE PaidAt
        END
      OUTPUT INSERTED.
      WHERE PaymentID = @paymentId
    `);

  return result.recordset[0] || null;
}

module.exports = {
  getAssignmentContext,
  getActivePaidTotalForAssignment,
  createPayment,
  findPaymentById,
  listPayments,
  updatePaymentStatus,
};