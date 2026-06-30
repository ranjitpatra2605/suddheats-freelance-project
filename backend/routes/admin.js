const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ContactQuery = require('../models/ContactQuery');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// @GET /api/admin/dashboard — stats
router.get('/dashboard', async (req, res) => {
    try {
        const [totalOrders, totalProducts, totalUsers, orders] = await Promise.all([
            Order.count(),
            Product.count(),
            User.count({ where: { role: 'user' } }),
            Order.findMany({})
        ]);
        const totalRevenue = orders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);
        const recentOrders = await Order.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        res.json({ totalOrders, totalProducts, totalUsers, totalRevenue, recentOrders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/admin/products — all products for admin
router.get('/products', async (req, res) => {
    try {
        const products = await Product.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/admin/orders
router.get('/orders', async (req, res) => {
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

// @GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        const users = await User.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                twoFactorEnabled: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/admin/inventory
router.get('/inventory', async (req, res) => {
    try {
        const products = await Product.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                stock: true,
                price: true,
                isFeatured: true,
                isBestSeller: true
            }
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PATCH /api/admin/inventory/:id — update stock
router.patch('/inventory/:id', async (req, res) => {
    try {
        const stock = parseInt(req.body.stock, 10);
        const product = await Product.update({
            where: { id: req.params.id },
            data: { stock: stock }
        });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/admin/inventory/:id — delete product
router.delete('/inventory/:id', async (req, res) => {
    try {
        const product = await Product.delete({
            where: { id: req.params.id }
        });
        res.json({ message: 'Product deleted successfully', product });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/admin/orders/:id/status — update order status
router.put('/orders/:id/status', async (req, res) => {
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

// @GET /api/admin/queries — all contact queries for admin
router.get('/queries', async (req, res) => {
    try {
        const queries = await ContactQuery.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(queries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
