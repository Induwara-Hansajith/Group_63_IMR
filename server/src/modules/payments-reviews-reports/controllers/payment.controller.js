const paymentService = require('../services/payment.service');
const { sendResponse } = require('../utils/response');

async function createPayment(req, res, next) {
  try {
    const payment = await paymentService.recordPayment(req.user, req.body);
    return sendResponse(res, 201, 'Payment recorded successfully.', payment);
  } catch (err) {
    return next(err);
  }
}
async function listPayments(req, res, next) {
  try {
    const payments = await paymentService.getPayments(req.user, {
      status: req.query.status,
      projectId: req.query.projectId,
    });
    return sendResponse(res, 200, 'Payments retrieved successfully.', payments);
  } catch (err) {
    return next(err);
  }
}
async function getPaymentById(req, res, next) {
  try {
    const payment = await paymentService.getPaymentById(req.user, Number(req.params.id));
    return sendResponse(res, 200, 'Payment retrieved successfully.', payment);
  } catch (err) {
    return next(err);
  }
}
async function updatePaymentStatus(req, res, next) {
  try {
    const updated = await paymentService.changePaymentStatus(
      req.user,
      Number(req.params.id),
      req.body.status
    );
    return sendResponse(res, 200, 'Payment status updated successfully.', updated);
  } catch (err) {
    return next(err);
  }
}
module.exports = {
  createPayment,
  listPayments,
  getPaymentById,
  updatePaymentStatus,
};