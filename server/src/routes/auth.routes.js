const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    {
      subject: String(user.userId),
      expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    }
  );
}

router.post("/register", async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";
  const role =
    typeof req.body.role === "string" ? req.body.role.toLowerCase() : "";
  const profile = req.body.profile || {};

  if (!email || !password || !["freelancer", "client"].includes(role)) {
    return res.status(400).json({
      message: "Provide an email, password, and role of freelancer or client.",
    });
  }

  if (
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return res.status(400).json({
      message: "Password must be at least 12 characters and at most 72 UTF-8 bytes.",
    });
  }

  if (
    role === "freelancer" &&
    (typeof profile.displayName !== "string" ||
      !profile.displayName.trim())
  ) {
    return res.status(400).json({
      message: "Freelancers must provide profile.displayName.",
    });
  }

  if (
    role === "client" &&
    (typeof profile.contactName !== "string" ||
      !profile.contactName.trim())
  ) {
    return res.status(400).json({
      message: "Clients must provide profile.contactName.",
    });
  }

  let transaction;
  let transactionStarted = false;

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const pool = await poolPromise;

    transaction = new sql.Transaction(pool);
    await transaction.begin();
    transactionStarted = true;

    const roleResult = await new sql.Request(transaction)
      .input("roleName", sql.NVarChar(30), role)
      .query(`
        SELECT RoleID
        FROM dbo.Roles
        WHERE RoleName = @roleName;
      `);

    if (roleResult.recordset.length === 0) {
      await transaction.rollback();
      transactionStarted = false;
      return res.status(500).json({ message: "Account role is not configured." });
    }

    const userResult = await new sql.Request(transaction)
      .input("roleID", sql.TinyInt, roleResult.recordset[0].RoleID)
      .input("email", sql.NVarChar(320), email)
      .input("passwordHash", sql.NVarChar(255), passwordHash)
      .query(`
        INSERT INTO dbo.Users (RoleID, Email, PasswordHash)
        OUTPUT INSERTED.UserID
        VALUES (@roleID, @email, @passwordHash);
      `);

    const userId = userResult.recordset[0].UserID;

    if (role === "freelancer") {
      await new sql.Request(transaction)
        .input("userID", sql.BigInt, userId)
        .input("displayName", sql.NVarChar(120), profile.displayName.trim())
        .query(`
          INSERT INTO dbo.FreelancerProfiles (UserID, DisplayName)
          VALUES (@userID, @displayName);
        `);
    } else {
      await new sql.Request(transaction)
        .input("userID", sql.BigInt, userId)
        .input(
          "organizationName",
          sql.NVarChar(200),
          profile.organizationName || null
        )
        .input("contactName", sql.NVarChar(120), profile.contactName.trim())
        .query(`
          INSERT INTO dbo.ClientProfiles
            (UserID, OrganizationName, ContactName)
          VALUES
            (@userID, @organizationName, @contactName);
        `);
    }

    await transaction.commit();
    transactionStarted = false;

    const user = { userId: Number(userId), role };
    return res.status(201).json({
      user,
      token: makeToken(user),
    });
  } catch (error) {
    if (transactionStarted) {
      await transaction.rollback().catch(() => {});
    }

    if (error.number === 2601 || error.number === 2627) {
      return res.status(409).json({ message: "That email is already registered." });
    }

    return res.status(500).json({ message: "Could not create the account." });
  }
});

router.post("/login", async (req, res) => {
  const email =
    typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  const password =
    typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar(320), email)
      .query(`
        SELECT
          u.UserID,
          u.Email,
          u.PasswordHash,
          u.AccountStatus,
          r.RoleName
        FROM dbo.Users AS u
        INNER JOIN dbo.Roles AS r ON r.RoleID = u.RoleID
        WHERE u.Email = @email;
      `);

    const account = result.recordset[0];

    if (!account || !(await bcrypt.compare(password, account.PasswordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    if (account.AccountStatus !== "active") {
      return res.status(403).json({ message: "This account is not active." });
    }

    const user = {
      userId: Number(account.UserID),
      role: account.RoleName,
    };

    return res.json({ user, token: makeToken(user) });
  } catch {
    return res.status(500).json({ message: "Could not sign in." });
  }
});

module.exports = router;