const Order = require('../models/Order');

exports.getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    const orders = await Order.find().populate('userId', 'email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getAllOrders error:', err);
    res.status(500).json({ error: 'Could not load admin orders.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { status } = req.body;
    const allowed = new Set(['pending', 'processing', 'delivered', 'cancelled']);
    if (!allowed.has(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Emit real-time event
    if (req.io) {
      req.io.emit('orderUpdated', order);
    }

    res.json(order);
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    res.status(500).json({ error: 'Could not update order status.' });
  }
};
