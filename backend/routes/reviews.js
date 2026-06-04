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
            where: { userId: req.user._id, productId: productId }
        });
        if (existing) return res.status(400).json({ message: 'You already reviewed this product' });

        const review = await Review.create({
            data: {
                userId: req.user._id,
                productId: productId,
                name: req.user.name,
                rating: ratingInt,
                comment
            }
        });

        // Update product rating
        const reviews = await Review.findMany({ where: { productId } });
        const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
        await Product.update({
            where: { _id: productId },
            data: {
                ratings: parseFloat(avgRating.toFixed(1)),
                numReviews: reviews.length
            }
        });

        res.status(201).json(review);
    } catch (err) {
        res.status(500).json({ message: err.message });
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
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
