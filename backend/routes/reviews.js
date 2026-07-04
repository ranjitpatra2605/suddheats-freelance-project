const express = require('express');
const Review = require('../models/Review');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @POST /api/reviews — add review
router.post('/', protect, async (req, res) => {
    try {
        const { productId, rating, comment } = req.body;
        const ratingInt = parseInt(rating, 10);

        const existing = await Review.findFirst({
            where: { userId: req.user.id, productId: productId }
        });
        if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

        console.log("Executing Prisma query...");
        const review = await Review.create({
            data: {
                userId: req.user.id,
                productId: productId,
                name: req.user.name,
                rating: ratingInt,
                comment
            }
        });
        console.log("Database write successful");

        // Update product rating
        const reviews = await Review.findMany({ where: { productId } });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        console.log("Executing Prisma query...");
        await Product.update({
            where: { id: productId },
            data: {
                ratings: parseFloat(avgRating.toFixed(1)),
                numReviews: reviews.length
            }
        });
        console.log("Database write successful");

        res.status(201).json(review);
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

// @GET /api/reviews/product/:productId
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.findMany({
            where: { productId: req.params.productId },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reviews);
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
