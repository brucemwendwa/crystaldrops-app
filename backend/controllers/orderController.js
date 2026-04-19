const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
  try {
    const { items, total, phone, deliveryName, deliveryLocation, paymentMethod } = req.body;

    const order = new Order({
      userId: req.user.id,
      items,
      total,
      phone,
      deliveryName: deliveryName || '',
      deliveryLocation: deliveryLocation || '',
      paymentMethod: paymentMethod || 'mpesa'
    });

    await order.save();
    
    // Emit real-time event
    if (req.io) {
      req.io.emit('orderCreated', order);
    }

    res.json(order);
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ error: 'Could not save order. Please try again.' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ error: 'Could not load orders.' });
  }
};
