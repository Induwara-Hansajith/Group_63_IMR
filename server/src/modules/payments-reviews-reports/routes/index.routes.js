const express = require('express');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');
const adminRoutes = require('./admin.routes');
const disputeRoutes = require('./dispute.routes');
const reportRoutes = require('./report.routes');

const router = express.Router();

router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);
router.use('/disputes', disputeRoutes);
router.use('/reports', reportRoutes);

module.exports = router;