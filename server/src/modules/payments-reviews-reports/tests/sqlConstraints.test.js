require('dotenv').config();
const { sql, getPool, closePool } = require('../config/db');

const runDbTests = process.env.RUN_DB_TESTS === 'true';
const describeDb = runDbTests ? describe : describe.skip;

describeDb('SQL Server Constraint Checks (AIFreelancePlatform)', () => {
  let pool;

  beforeAll(async () => {
    pool = await getPool();
  });

  afterAll(async () => {
    await closePool();
  });

  async function expectSqlError(fn) {
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      await expect(fn(transaction)).rejects.toThrow();
    } finally {
      await transaction.rollback();
    }
  }

  test('CK_Payments_Amount rejects Amount <= 0', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Payments (AssignmentID, Amount, PaymentStatus)
        VALUES (1, 0, N'pending')
      `);
    });
  });

  test('CK_Payments_Status rejects invalid PaymentStatus', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Payments (AssignmentID, Amount, PaymentStatus)
        VALUES (1, 100, N'invalid_status')
      `);
    });
  });

  test('FK_Payments_Assignments rejects non-existent AssignmentID', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Payments (AssignmentID, Amount, PaymentStatus)
        VALUES (99999999, 100, N'pending')
      `);
    });
  });

  test('CK_Reviews_Rating rejects rating outside 1..5', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Reviews (ProjectID, ReviewerID, RevieweeID, Rating)
        VALUES (1, 1, 2, 6)
      `);
    });
  });

  test('CK_Reviews_DifferentUsers rejects self-review', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Reviews (ProjectID, ReviewerID, RevieweeID, Rating)
        VALUES (1, 1, 1, 5)
      `);
    });
  });

  test('CK_Disputes_Status rejects invalid dispute status', async () => {
    await expectSqlError(async (tx) => {
      await new sql.Request(tx).query(`
        INSERT INTO dbo.Disputes (ProjectID, RaisedByUserID, Subject, Description, Status)
        VALUES (1, 1, N'Test', N'Invalid status test', N'rejected')
      `);
    });
  });
});