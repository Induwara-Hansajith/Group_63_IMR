const AppError = require('../utils/AppError');
const paymentModel = require('../models/payment.model');

const VALID_METHODS = ['card', 'bank_transfer', 'paypal'];
const VALID_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

const ALLOWED_TRANSITIONS = {
  pending: ['paid', 'failed'],
  paid: ['refunded'],
  failed: ['pending'],
  refunded: [],
};

async function recordPayment(currentUser, payload) {
  const {
    projectId,
    assignmentId,
    amount,
    paymentMethod,
    paymentStatus = 'pending',
    currencyCode,
    transactionRef,
    allowOverpayment = false,
  } = payload;

  const context = await paymentModel.getAssignmentContext(assignmentId);
  if (!context) {
    throw new AppError(
      'Assignment not found. A freelancer must be assigned before recording a payment.',
      404
    );
  }

  if (Number(context.ProjectID) !== Number(projectId)) {
    throw new AppError('The specified assignment does not belong to this project.', 400);
  }

  if (
    currentUser.role === 'client' &&
    Number(context.ClientID) !== Number(currentUser.id)
  ) {
    throw new AppError('You can only record payments for your own projects.', 403);
  }

  if (context.AssignmentStatus === 'cancelled') {
    throw new AppError('Cannot record a payment for a cancelled assignment.', 400);
  }

  const existingCommitted = await paymentModel.getActivePaidTotalForAssignment(assignmentId);
  const agreedPrice = Number(context.AgreedPrice);
  const numericAmount = Number(amount);

  if (
    paymentStatus !== 'failed' &&
    paymentStatus !== 'refunded' &&
    existingCommitted + numericAmount > agreedPrice
  ) {
    const canOverride = currentUser.role === 'admin' && Boolean(allowOverpayment);
    if (!canOverride) {
      throw new AppError(
        `Payment exceeds agreed price (${agreedPrice.toFixed(2)}). Already committed: ${existingCommitted.toFixed(2)}.`,
        400
      );
    }
  }

  const paidAt = paymentStatus === 'paid' ? new Date() : null;

  return paymentModel.createPayment({
    assignmentId: Number(assignmentId),
    amount: numericAmount,
    currencyCode: (currencyCode || context.AgreedCurrency || 'USD').toUpperCase(),
    paymentStatus,
    paymentMethod,
    transactionRef,
    paidAt,
  });
}

async function getPayments(currentUser, filters) {
  return paymentModel.listPayments({
    userId: currentUser.id,
    role: currentUser.role,
    status: filters.status,
    projectId: filters.projectId ? Number(filters.projectId) : null,
  });
}

async function getPaymentById(currentUser, paymentId) {
  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  const isClientOwner =
    currentUser.role === 'client' && Number(payment.ClientID) === Number(currentUser.id);
  const isFreelancerOwner =
    currentUser.role === 'freelancer' &&
    Number(payment.FreelancerID) === Number(currentUser.id);
  const isAdminOrManager = ['admin', 'manager'].includes(currentUser.role);

  if (!isClientOwner && !isFreelancerOwner && !isAdminOrManager) {
    throw new AppError('You are not authorized to view this payment.', 403);
  }

  return payment;
}

async function changePaymentStatus(currentUser, paymentId, nextStatus) {
  const payment = await paymentModel.findPaymentById(paymentId);
  if (!payment) {
    throw new AppError('Payment not found.', 404);
  }

  const isClientOwner =
    currentUser.role === 'client' && Number(payment.ClientID) === Number(currentUser.id);
  if (!isClientOwner && currentUser.role !== 'admin') {
    throw new AppError('You are not authorized to update this payment.', 403);
  }

  if (nextStatus === 'refunded' && currentUser.role !== 'admin') {
    throw new AppError('Only administrators can mark a payment as refunded.', 403);
  }

  const allowedNext = ALLOWED_TRANSITIONS[payment.PaymentStatus] || [];
  if (!allowedNext.includes(nextStatus)) {
    throw new AppError(
      `Invalid status transition from '${payment.PaymentStatus}' to '${nextStatus}'.`,
      400
    );
  }

  return paymentModel.updatePaymentStatus(paymentId, nextStatus);
}

module.exports = {
  VALID_METHODS,
  VALID_STATUSES,
  ALLOWED_TRANSITIONS,
  recordPayment,
  getPayments,
  getPaymentById,
  changePaymentStatus,
};