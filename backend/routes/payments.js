const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/stkpush', auth, paymentController.generateAccessToken, paymentController.stkPush);
router.post('/callback', paymentController.callback);

module.exports = router;
