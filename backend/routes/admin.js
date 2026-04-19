const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/orders', auth, adminController.getAllOrders);
router.put('/orders/:id', auth, adminController.updateOrderStatus);

module.exports = router;
