const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

// @GET /api/products — public, with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, featured, bestseller } = req.query;
        const filter = {};
        if (category) filter.category = category;
        if (featured === 'true') filter.isFeatured = true;
        if (bestseller === 'true') filter.isBestSeller = true;
        if (search) {
            filter.name = { contains: search, mode: 'insensitive' };
        }

        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'rating') orderBy = { ratings: 'desc' };

        const products = await Product.findMany({
            where: filter,
            orderBy: orderBy
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/products/:slug — public
router.get('/:slug', async (req, res) => {
    try {
        const product = await Product.findUnique({ where: { slug: req.params.slug } });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/products — admin only
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.price !== undefined) data.price = parseFloat(data.price);
        if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
        if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
        if (data.ratings !== undefined) data.ratings = parseFloat(data.ratings);
        if (data.numReviews !== undefined) data.numReviews = parseInt(data.numReviews, 10);
        if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true' || data.isFeatured === true;
        if (data.isBestSeller !== undefined) data.isBestSeller = data.isBestSeller === 'true' || data.isBestSeller === true;

        const product = await Product.create({ data });
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @PUT /api/products/:id — admin only
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const data = { ...req.body };
        if (data.price !== undefined) data.price = parseFloat(data.price);
        if (data.stock !== undefined) data.stock = parseInt(data.stock, 10);
        if (data.originalPrice !== undefined) data.originalPrice = data.originalPrice ? parseFloat(data.originalPrice) : null;
        if (data.ratings !== undefined) data.ratings = parseFloat(data.ratings);
        if (data.numReviews !== undefined) data.numReviews = parseInt(data.numReviews, 10);
        if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true' || data.isFeatured === true;
        if (data.isBestSeller !== undefined) data.isBestSeller = data.isBestSeller === 'true' || data.isBestSeller === true;

        const product = await Product.update({
            where: { _id: req.params.id },
            data: data
        });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/products/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await Product.delete({ where: { _id: req.params.id } });
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
