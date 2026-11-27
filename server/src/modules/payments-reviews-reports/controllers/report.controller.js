const reportService = require('../services/report.service');
const { sendResponse } = require('../utils/response');

async function getProjectActivity(req, res, next) {
  try {
    const data = await reportService.getProjectActivityReport(req.query);
    return sendResponse(res, 200, 'Project activity report generated.', data);
  } catch (err) {
    return next(err);
  }
}

async function getUserActivity(req, res, next) {
  try {
    const data = await reportService.getUserActivityReport(req.query);
    return sendResponse(res, 200, 'User activity report generated.', data);
  } catch (err) {
    return next(err);
  }
}

async function getSkillServiceDemand(req, res, next) {
  try {
    const data = await reportService.getDemandReport(req.query);
    return sendResponse(res, 200, 'Skill and service demand report generated.', data);
  } catch (err) {
    return next(err);
  }
}

async function getRevenue(req, res, next) {
  try {
    const data = await reportService.getRevenueReport(req.query);
    return sendResponse(res, 200, 'Payments and revenue report generated.', data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getProjectActivity,
  getUserActivity,
  getSkillServiceDemand,
  getRevenue,
};