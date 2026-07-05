const express = require('express');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

const router = express.Router();

// @GET /api/products — public, with filters
router.get('/', async (req, res) => {
    try {
        const { category, search, sort, featured, bestseller } = req.query;

        if (featured === 'true') {
            console.log("Executing Prisma query...");
            const products = await Product.findMany({
                where: { isFeatured: true }
            });
            console.log("Database write successful");
            return res.json({ products });
        }

        if (bestseller === 'true') {
            console.log("Executing Prisma query...");
            const products = await Product.findMany({
                where: { isBestSeller: true }
            });
            console.log("Database write successful");
            return res.json({ products });
        }

        const filter = {};
        if (category) filter.category = category;
        if (search) {
            filter.name = { contains: search, mode: 'insensitive' };
        }

        let orderBy = { createdAt: 'desc' };
        if (sort === 'price_asc') orderBy = { price: 'asc' };
        else if (sort === 'price_desc') orderBy = { price: 'desc' };
        else if (sort === 'rating') orderBy = { ratings: 'desc' };

        console.log("Executing Prisma query...");
        const products = await Product.findMany({
            where: filter,
            orderBy: orderBy
        });
        console.log("Database write successful");
        res.json({ products });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @GET /api/products/:slug — public
router.get('/:slug', async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        const product = await Product.findUnique({ where: { slug: req.params.slug } });
        console.log("Database write successful");
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
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

        console.log("Executing Prisma query...");
        const product = await Product.create({ data });
        console.log("Database write successful");
        res.status(201).json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
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

        console.log("Executing Prisma query...");
        const product = await Product.update({
            where: { id: req.params.id },
            data: data
        });
        console.log("Database write successful");
        res.json(product);
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

// @DELETE /api/products/:id — admin only
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        console.log("Executing Prisma query...");
        await Product.delete({ where: { id: req.params.id } });
        console.log("Database write successful");
        res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error(error);
        console.error(error.stack);
    
        return res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
});

module.exports = router;
