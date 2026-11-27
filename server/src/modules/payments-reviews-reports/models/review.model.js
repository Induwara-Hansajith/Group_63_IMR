const { sql, getPool } = require('../config/db');
const { TABLES } = require('../config/tableNames');

async function getProjectReviewContext(projectId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('projectId', sql.BigInt, projectId)
    .query(`
      SELECT
        p.ProjectID,
        p.Title AS ProjectTitle,
        p.ClientID,
        p.Status AS ProjectStatus,
        a.AssignmentID,
        a.FreelancerID,
        a.Status AS AssignmentStatus
      FROM ${TABLES.PROJECTS} AS p
      LEFT JOIN ${TABLES.ASSIGNMENTS} AS a ON a.ProjectID = p.ProjectID
      WHERE p.ProjectID = @projectId
    `);

  return result.recordset[0] || null;
}

async function findReviewByProjectAndReviewer(projectId, reviewerId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('projectId', sql.BigInt, projectId)
    .input('reviewerId', sql.BigInt, reviewerId)
    .query(`
      SELECT ReviewID, ProjectID, ReviewerID, RevieweeID, Rating, Comment, CreatedAt
      FROM ${TABLES.REVIEWS}
      WHERE ProjectID = @projectId AND ReviewerID = @reviewerId
    `);

  return result.recordset[0] || null;
}

async function createReview({ projectId, reviewerId, revieweeId, rating, comment }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('projectId', sql.BigInt, projectId)
    .input('reviewerId', sql.BigInt, reviewerId)
    .input('revieweeId', sql.BigInt, revieweeId)
    .input('rating', sql.TinyInt, rating)
    .input('comment', sql.NVarChar(2000), comment || null)
    .query(`
      INSERT INTO ${TABLES.REVIEWS}
        (ProjectID, ReviewerID, RevieweeID, Rating, Comment)
      OUTPUT INSERTED.
      VALUES
        (@projectId, @reviewerId, @revieweeId, @rating, @comment)
    `);

  return result.recordset[0];
}

async function getReviewsForUser(userId) {
  const pool = await getPool();

  const [reviewsResult, summaryResult] = await Promise.all([
    pool
      .request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT
          r.ReviewID,
          r.ProjectID,
          p.Title AS ProjectTitle,
          r.ReviewerID,
          COALESCE(fp.DisplayName, cp.ContactName, u.Email) AS ReviewerName,
          r.RevieweeID,
          r.Rating,
          r.Comment,
          r.CreatedAt
        FROM ${TABLES.REVIEWS} AS r
        INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = r.ProjectID
        INNER JOIN ${TABLES.USERS} AS u ON u.UserID = r.ReviewerID
        LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS fp ON fp.UserID = r.ReviewerID
        LEFT JOIN ${TABLES.CLIENT_PROFILES} AS cp ON cp.UserID = r.ReviewerID
        WHERE r.RevieweeID = @userId
        ORDER BY r.CreatedAt DESC
      `),
    pool
      .request()
      .input('userId', sql.BigInt, userId)
      .query(`
        SELECT
          dbo.fn_UserAverageRating(@userId) AS AverageRating,
          COUNT() AS TotalReviews
        FROM ${TABLES.REVIEWS}
        WHERE RevieweeID = @userId
      `),
  ]);

  const summary = summaryResult.recordset[0] || { AverageRating: null, TotalReviews: 0 };

  return {
    userId: Number(userId),
    averageRating: summary.AverageRating !== null ? Number(summary.AverageRating) : null,
    totalReviews: Number(summary.TotalReviews),
    reviews: reviewsResult.recordset,
  };
}

async function getReviewsByReviewer(reviewerId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('reviewerId', sql.BigInt, reviewerId)
    .query(`
      SELECT
        r.ReviewID,
        r.ProjectID,
        p.Title AS ProjectTitle,
        r.ReviewerID,
        r.RevieweeID,
        COALESCE(fp.DisplayName, cp.ContactName, u.Email) AS RevieweeName,
        r.Rating,
        r.Comment,
        r.CreatedAt
      FROM ${TABLES.REVIEWS} AS r
      INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = r.ProjectID
      INNER JOIN ${TABLES.USERS} AS u ON u.UserID = r.RevieweeID
      LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS fp ON fp.UserID = r.RevieweeID
      LEFT JOIN ${TABLES.CLIENT_PROFILES} AS cp ON cp.UserID = r.RevieweeID
      WHERE r.ReviewerID = @reviewerId
      ORDER BY r.CreatedAt DESC
    `);

  return result.recordset;
}

async function getReviewsForProject(projectId) {
  const pool = await getPool();

  const [reviewsResult, summaryResult] = await Promise.all([
    pool
      .request()
      .input('projectId', sql.BigInt, projectId)
      .query(`
        SELECT
          r.ReviewID,
          r.ProjectID,
          r.ReviewerID,
          COALESCE(rfp.DisplayName, rcp.ContactName, ru.Email) AS ReviewerName,
          r.RevieweeID,
          COALESCE(efp.DisplayName, ecp.ContactName, eu.Email) AS RevieweeName,
          r.Rating,
          r.Comment,
          r.CreatedAt
        FROM ${TABLES.REVIEWS} AS r
        INNER JOIN ${TABLES.USERS} AS ru ON ru.UserID = r.ReviewerID
        LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS rfp ON rfp.UserID = r.ReviewerID
        LEFT JOIN ${TABLES.CLIENT_PROFILES} AS rcp ON rcp.UserID = r.ReviewerID
        INNER JOIN ${TABLES.USERS} AS eu ON eu.UserID = r.RevieweeID
        LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS efp ON efp.UserID = r.RevieweeID
        LEFT JOIN ${TABLES.CLIENT_PROFILES} AS ecp ON ecp.UserID = r.RevieweeID
        WHERE r.ProjectID = @projectId
        ORDER BY r.CreatedAt DESC
      `),
    pool
      .request()
      .input('projectId', sql.BigInt, projectId)
      .query(`
        SELECT
          CAST(AVG(CAST(Rating AS DECIMAL(4,2))) AS DECIMAL(3,2)) AS AverageRating,
          COUNT() AS TotalReviews
        FROM ${TABLES.REVIEWS}
        WHERE ProjectID = @projectId
      `),
  ]);

  const summary = summaryResult.recordset[0] || { AverageRating: null, TotalReviews: 0 };

  return {
    projectId: Number(projectId),
    averageRating: summary.AverageRating !== null ? Number(summary.AverageRating) : null,
    totalReviews: Number(summary.TotalReviews),
    reviews: reviewsResult.recordset,
  };
}

module.exports = {
  getProjectReviewContext,
  findReviewByProjectAndReviewer,
  createReview,
  getReviewsForUser,
  getReviewsByReviewer,
  getReviewsForProject,
};