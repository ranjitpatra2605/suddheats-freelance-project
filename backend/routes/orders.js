const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

router.post('/', protect, async (req, res) => {
    try {
        const { items, shippingAddress, itemsPrice, shippingPrice, totalPrice, paymentMethod } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

        // Reduce stock
        for (const item of items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            itemsPrice,
            shippingPrice,
            totalPrice,
            paymentMethod
        });

        // Clear cart
        await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/myorders — user's own orders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/track/:id — public track by order ID
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).select('status items totalPrice shippingAddress createdAt isPaid paidAt');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/:id — get single order (owner or admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/orders/:id/pay — mark as paid (called after payment verify)
router.put('/:id/pay', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'email phone');
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Processing';
        order.paymentResult = req.body;
        
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/orders/:id/status — admin update status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        order.status = req.body.status;
        if (req.body.status === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders — admin all orders
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;


