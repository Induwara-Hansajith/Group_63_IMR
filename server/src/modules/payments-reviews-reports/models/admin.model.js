const { sql, getPool } = require('../config/db');
const { TABLES } = require('../config/tableNames');

async function listUsers({ role, status }) {
  const pool = await getPool();
  const request = pool.request();
  const conditions = [];

  if (role) {
    request.input('role', sql.NVarChar(30), role);
    conditions.push('r.RoleName = @role');
  }

  if (status) {
    request.input('status', sql.NVarChar(20), status);
    conditions.push('u.AccountStatus = @status');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await request.query(`
    SELECT
      u.UserID,
      u.Email,
      r.RoleName AS Role,
      u.AccountStatus,
      COALESCE(fp.DisplayName, cp.ContactName, u.Email) AS DisplayName,
      cp.OrganizationName,
      u.CreatedAt,
      u.UpdatedAt
    FROM ${TABLES.USERS} AS u
    INNER JOIN ${TABLES.ROLES} AS r ON r.RoleID = u.RoleID
    LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS fp ON fp.UserID = u.UserID
    LEFT JOIN ${TABLES.CLIENT_PROFILES} AS cp ON cp.UserID = u.UserID
    ${whereClause}
    ORDER BY u.CreatedAt DESC
  `);

  return result.recordset;
}

async function findUserById(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('userId', sql.BigInt, userId)
    .query(`
      SELECT
        u.UserID,
        u.Email,
        r.RoleName AS Role,
        u.AccountStatus
      FROM ${TABLES.USERS} AS u
      INNER JOIN ${TABLES.ROLES} AS r ON r.RoleID = u.RoleID
      WHERE u.UserID = @userId
    `);

  return result.recordset[0] || null;
}

async function updateUserAccountStatus(userId, accountStatus) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('userId', sql.BigInt, userId)
    .input('accountStatus', sql.NVarChar(20), accountStatus)
    .query(`
      UPDATE ${TABLES.USERS}
      SET
        AccountStatus = @accountStatus,
        UpdatedAt = SYSUTCDATETIME()
      OUTPUT
        INSERTED.UserID,
        INSERTED.Email,
        INSERTED.AccountStatus,
        INSERTED.UpdatedAt
      WHERE UserID = @userId
    `);

  return result.recordset[0] || null;
}

async function listSkillCategories() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      sc.SkillCategoryID,
      sc.CategoryName,
      COUNT(s.SkillID) AS SkillCount
    FROM ${TABLES.SKILL_CATEGORIES} AS sc
    LEFT JOIN ${TABLES.AI_SKILLS} AS s ON s.SkillCategoryID = sc.SkillCategoryID
    GROUP BY sc.SkillCategoryID, sc.CategoryName
    ORDER BY sc.CategoryName ASC
  `);

  return result.recordset;
}

async function createSkillCategory(categoryName) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryName', sql.NVarChar(100), categoryName)
    .query(`
      INSERT INTO ${TABLES.SKILL_CATEGORIES} (CategoryName)
      OUTPUT INSERTED.
      VALUES (@categoryName)
    `);

  return result.recordset[0];
}

async function updateSkillCategory(categoryId, categoryName) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryId', sql.Int, categoryId)
    .input('categoryName', sql.NVarChar(100), categoryName)
    .query(`
      UPDATE ${TABLES.SKILL_CATEGORIES}
      SET CategoryName = @categoryName
      OUTPUT INSERTED.
      WHERE SkillCategoryID = @categoryId
    `);

  return result.recordset[0] || null;
}

async function deleteSkillCategory(categoryId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryId', sql.Int, categoryId)
    .query(`
      DELETE FROM ${TABLES.SKILL_CATEGORIES}
      OUTPUT DELETED.
      WHERE SkillCategoryID = @categoryId
    `);

  return result.recordset[0] || null;
}

async function listServiceCategories() {
  const pool = await getPool();
  const result = await pool.request().query(`
    SELECT
      sc.ServiceCategoryID,
      sc.CategoryName,
      COUNT(s.ServiceID) AS ServiceCount
    FROM ${TABLES.SERVICE_CATEGORIES} AS sc
    LEFT JOIN ${TABLES.AI_SERVICES} AS s ON s.ServiceCategoryID = sc.ServiceCategoryID
    GROUP BY sc.ServiceCategoryID, sc.CategoryName
    ORDER BY sc.CategoryName ASC
  `);

  return result.recordset;
}

async function createServiceCategory(categoryName) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryName', sql.NVarChar(100), categoryName)
    .query(`
      INSERT INTO ${TABLES.SERVICE_CATEGORIES} (CategoryName)
      OUTPUT INSERTED.
      VALUES (@categoryName)
    `);

  return result.recordset[0];
}

async function updateServiceCategory(categoryId, categoryName) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryId', sql.Int, categoryId)
    .input('categoryName', sql.NVarChar(100), categoryName)
    .query(`
      UPDATE ${TABLES.SERVICE_CATEGORIES}
      SET CategoryName = @categoryName
      OUTPUT INSERTED.
      WHERE ServiceCategoryID = @categoryId
    `);

  return result.recordset[0] || null;
}

async function deleteServiceCategory(categoryId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('categoryId', sql.Int, categoryId)
    .query(`
      DELETE FROM ${TABLES.SERVICE_CATEGORIES}
      OUTPUT DELETED.
      WHERE ServiceCategoryID = @categoryId
    `);

  return result.recordset[0] || null;
}

async function getProjectParticipants(projectId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('projectId', sql.BigInt, projectId)
    .query(`
      SELECT
        p.ProjectID,
        p.Title AS ProjectTitle,
        p.ClientID,
        a.FreelancerID
      FROM ${TABLES.PROJECTS} AS p
      LEFT JOIN ${TABLES.ASSIGNMENTS} AS a ON a.ProjectID = p.ProjectID
      WHERE p.ProjectID = @projectId
    `);

  return result.recordset[0] || null;
}

async function createDispute({ projectId, raisedByUserId, subject, description }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('projectId', sql.BigInt, projectId)
    .input('raisedByUserId', sql.BigInt, raisedByUserId)
    .input('subject', sql.NVarChar(200), subject)
    .input('description', sql.NVarChar(sql.MAX), description)
    .query(`
      INSERT INTO ${TABLES.DISPUTES}
        (ProjectID, RaisedByUserID, Subject, Description)
      OUTPUT INSERTED.
      VALUES
        (@projectId, @raisedByUserId, @subject, @description)
    `);

  return result.recordset[0];
}

async function listDisputes({ status, userId }) {
  const pool = await getPool();
  const request = pool.request();
  const conditions = [];

  if (status) {
    request.input('status', sql.NVarChar(20), status);
    conditions.push('d.Status = @status');
  }

  if (userId) {
    request.input('userId', sql.BigInt, userId);
    conditions.push('(d.RaisedByUserID = @userId OR p.ClientID = @userId OR a.FreelancerID = @userId)');
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await request.query(`
    SELECT
      d.DisputeID,
      d.ProjectID,
      p.Title AS ProjectTitle,
      d.RaisedByUserID,
      COALESCE(fp.DisplayName, cp.ContactName, u.Email) AS RaisedByName,
      u.Email AS RaisedByEmail,
      d.Subject,
      d.Description,
      d.Status,
      d.CreatedAt,
      d.ResolvedAt
    FROM ${TABLES.DISPUTES} AS d
    INNER JOIN ${TABLES.PROJECTS} AS p ON p.ProjectID = d.ProjectID
    LEFT JOIN ${TABLES.ASSIGNMENTS} AS a ON a.ProjectID = d.ProjectID
    INNER JOIN ${TABLES.USERS} AS u ON u.UserID = d.RaisedByUserID
    LEFT JOIN ${TABLES.FREELANCER_PROFILES} AS fp ON fp.UserID = d.RaisedByUserID
    LEFT JOIN ${TABLES.CLIENT_PROFILES} AS cp ON cp.UserID = d.RaisedByUserID
    ${whereClause}
    ORDER BY d.CreatedAt DESC
  `);

  return result.recordset;
}

async function findDisputeById(disputeId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('disputeId', sql.BigInt, disputeId)
    .query(`
      SELECT DisputeID, ProjectID, RaisedByUserID, Subject, Description, Status, CreatedAt, ResolvedAt
      FROM ${TABLES.DISPUTES}
      WHERE DisputeID = @disputeId
    `);

  return result.recordset[0] || null;
}

async function updateDisputeStatus(disputeId, status) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input('disputeId', sql.BigInt, disputeId)
    .input('status', sql.NVarChar(20), status)
    .query(`
      UPDATE ${TABLES.DISPUTES}
      SET
        Status = @status,
        ResolvedAt = CASE
          WHEN @status IN (N'resolved', N'closed') THEN COALESCE(ResolvedAt, SYSUTCDATETIME())
          ELSE NULL
        END
      OUTPUT INSERTED.
      WHERE DisputeID = @disputeId
    `);

  return result.recordset[0] || null;
}

module.exports = {
  listUsers,
  findUserById,
  updateUserAccountStatus,
  listSkillCategories,
  createSkillCategory,
  updateSkillCategory,
  deleteSkillCategory,
  listServiceCategories,
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getProjectParticipants,
  createDispute,
  listDisputes,
  findDisputeById,
  updateDisputeStatus,
};