const express = require('express');
const paymentRoutes = require('./payment.routes');
const reviewRoutes = require('./review.routes');

const router = express.Router();

router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;