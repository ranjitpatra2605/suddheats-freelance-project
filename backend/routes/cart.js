const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to populate products in cart items
const populateCartItems = async (cart) => {
    if (!cart) return null;
    const items = Array.isArray(cart.items) ? cart.items : [];
    if (items.length === 0) return { ...cart, items: [] };

    const productIds = items.map(item => item.product).filter(Boolean);
    const products = await Product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, thumbnail: true, slug: true, stock: true }
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const populatedItems = items.map(item => ({
        ...item,
        product: productMap.get(item.product) || null
    }));

    return {
        ...cart,
        items: populatedItems
    };
};

// @GET /api/cart — get user cart
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            return res.json({ items: [] });
        }
        const populatedCart = await populateCartItems(cart);
        res.json(populatedCart);
    } catch (err) {
        console.error("Cart GET Error:", err);
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/cart — add item or update qty
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const product = await Product.findUnique({ where: { id: productId } });
        if (!product) return res.status(404).json({ message: 'Product not found' });

        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) {
            cart = await Cart.create({
                data: { userId: req.user.id, items: [] }
            });
        }

        const items = Array.isArray(cart.items) ? cart.items : [];
        const itemIndex = items.findIndex(i => i.product === productId);

        if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

        if (itemIndex > -1) {
            items[itemIndex].quantity = quantity;
        } else {
            items.push({
                product: productId,
                name: product.name,
                image: product.thumbnail,
                price: product.price,
                quantity,
                weight: null,
                packaging: null
            });
        }

        const updatedCart = await Cart.update({
            where: { id: cart.id },
            data: { items }
        });

        const populatedCart = await populateCartItems(updatedCart);
        res.json(populatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @POST /api/cart/update-options — update options of an item
router.post('/update-options', protect, async (req, res) => {
    try {
        const { productId, weight, packaging, price } = req.body;
        let cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = Array.isArray(cart.items) ? cart.items : [];
        const itemIndex = items.findIndex(i => i.product === productId);
        if (itemIndex > -1) {
            items[itemIndex].weight = weight;
            items[itemIndex].packaging = packaging;
            items[itemIndex].price = price;
            
            const updatedCart = await Cart.update({
                where: { id: cart.id },
                data: { items }
            });

            const populatedCart = await populateCartItems(updatedCart);
            return res.json(populatedCart);
        }
        
        res.status(404).json({ message: 'Item not found in cart' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/cart/:productId — remove item
router.delete('/:productId', protect, async (req, res) => {
    try {
        const cart = await Cart.findUnique({ where: { userId: req.user.id } });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const items = Array.isArray(cart.items) ? cart.items : [];
        const filteredItems = items.filter(i => i.product !== req.params.productId);

        const updatedCart = await Cart.update({
            where: { id: cart.id },
            data: { items: filteredItems }
        });

        const populatedCart = await populateCartItems(updatedCart);
        res.json(populatedCart);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @DELETE /api/cart — clear entire cart
router.delete('/', protect, async (req, res) => {
    try {
        await Cart.upsert({
            where: { userId: req.user.id },
            update: { items: [] },
            create: { userId: req.user.id, items: [] }
        });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
