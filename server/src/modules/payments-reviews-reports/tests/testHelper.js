const express = require('express');
const jwt = require('jsonwebtoken');
const member5Routes = require('../routes/index.routes');
const { errorHandler } = require('../middleware/error.middleware');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key';
process.env.NODE_ENV = 'test';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api', member5Routes);
  app.use(errorHandler);
  return app;
}

function makeToken({ id, role, email = 'user@test.com' }) {
  return jwt.sign({ userId: id, role, email }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
}

module.exports = { createTestApp, makeToken };