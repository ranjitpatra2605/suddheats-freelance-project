const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const prisma = require('../models/db');
const { mapIdToUnderscoreId } = require('../models/prismaHelper');

const router = Router = express.Router();

router.post('/', protect, async (req, res) => {
    try {
        const { items, shippingAddress, itemsPrice, shippingPrice, totalPrice, paymentMethod } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });

        // Run stock decrement, order creation, and cart clearance in a transaction
        const order = await prisma.$transaction(async (tx) => {
            // Reduce stock
            for (const item of items) {
                await tx.product.update({
                    where: { id: item.product },
                    data: { stock: { decrement: item.quantity } }
                });
            }

            // Create order
            const newOrder = await tx.order.create({
                data: {
                    userId: req.user.id,
                    items: items,
                    shippingAddress: shippingAddress,
                    itemsPrice: parseFloat(itemsPrice),
                    shippingPrice: parseFloat(shippingPrice),
                    totalPrice: parseFloat(totalPrice),
                    paymentMethod: paymentMethod
                }
            });

            // Clear cart
            await tx.cart.update({
                where: { userId: req.user.id },
                data: { items: [] }
            });

            return newOrder;
        });

        // Map database id to id for frontend compatibility
        res.status(201).json(mapIdToUnderscoreId(order));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/myorders — user's own orders
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/track/:id — public track by order ID
router.get('/track/:id', async (req, res) => {
    try {
        const order = await Order.findUnique({
            where: { id: req.params.id },
            select: {
                id: true,
                status: true,
                items: true,
                totalPrice: true,
                shippingAddress: true,
                createdAt: true,
                isPaid: true,
                paidAt: true
            }
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders/:id — get single order (owner or admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.userId !== req.user.id && req.user.role !== 'admin') {
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
        const order = await Order.update({
            where: { id: req.params.id },
            data: {
                isPaid: true,
                paidAt: new Date(),
                status: 'Processing',
                paymentResult: req.body
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        phone: true
                    }
                }
            }
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/orders/:id/status — admin update status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const status = req.body.status;
        const updateData = { status };
        if (status === 'Delivered') {
            updateData.isDelivered = true;
            updateData.deliveredAt = new Date();
        }
        const order = await Order.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/orders — admin all orders
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const orders = await Order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
