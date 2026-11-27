const AppError = require('../utils/AppError');
const reportModel = require('../models/report.model');

function parseDateFilters({ from, to }) {
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  if (fromDate && Number.isNaN(fromDate.getTime())) {
    throw new AppError('Invalid "from" date. Use YYYY-MM-DD format.', 400);
  }

  if (toDate && Number.isNaN(toDate.getTime())) {
    throw new AppError('Invalid "to" date. Use YYYY-MM-DD format.', 400);
  }

  if (fromDate && toDate && fromDate > toDate) {
    throw new AppError('"from" date cannot be later than "to" date.', 400);
  }

  return {
    from: from || null,
    to: to || null,
  };
}

async function getProjectActivityReport(query) {
  const filters = parseDateFilters(query);
  const report = await reportModel.getProjectActivity(filters);
  return { filters, ...report };
}

async function getUserActivityReport(query) {
  const filters = parseDateFilters(query);
  const report = await reportModel.getUserActivity(filters);
  return { filters, ...report };
}

async function getDemandReport(query) {
  const filters = parseDateFilters(query);
  const report = await reportModel.getSkillAndServiceDemand(filters);
  return { filters, ...report };
}

async function getRevenueReport(query) {
  const filters = parseDateFilters(query);
  const report = await reportModel.getPaymentsAndRevenue(filters);
  return { filters, ...report };
}

module.exports = {
  getProjectActivityReport,
  getUserActivityReport,
  getDemandReport,
  getRevenueReport,
};