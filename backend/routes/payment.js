const express = require('express');
const crypto = require('crypto');
const prisma = require('../models/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getCashfreeURL = () => {
    // Default to production for real payments
    return process.env.CASHFREE_ENV === 'SANDBOX' 
        ? 'https://sandbox.cashfree.com/pg/orders' 
        : 'https://api.cashfree.com/pg/orders';
};

// @POST /api/payment/create-order
// Create Cashfree order and return payment session id
router.post('/create-order', protect, async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.status(400).json({ message: 'Order ID is required' });
        }

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const returnUrl = `${process.env.FRONTEND_URL || req.headers.origin || 'https://suddheats-freelance-project.vercel.app'}/payment/verify?order_id={order_id}`;
        console.log("Order Creation API called, return_url:", returnUrl);

        // Call Cashfree API to create the order session
        const response = await fetch(getCashfreeURL(), {
            method: 'POST',
            headers: {
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET_KEY,
                'x-api-version': '2023-08-01',
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                order_id: order.id,
                order_amount: order.totalPrice,
                order_currency: 'INR',
                customer_details: {
                    customer_id: order.user.id,
                    customer_phone: order.user.phone || '9999999999',
                    customer_email: order.user.email || 'customer@example.com',
                    customer_name: order.user.name || 'Customer'
                },
                order_meta: {
                    // This will be called by frontend upon completion
                    return_url: returnUrl
                }
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Cashfree Create Order Error:', data);
            return res.status(response.status).json({ message: data.message || 'Failed to create payment session' });
        }

        res.json({ payment_session_id: data.payment_session_id });
    } catch (err) {
        console.error('Create Order Exception:', err);
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/payment/webhook
// Reject GET requests gracefully on the webhook route
router.get('/webhook', (req, res) => {
    res.status(404).json({ message: 'GET method not supported for webhook endpoint. Please use POST.' });
});

// @POST /api/payment/webhook
// Cashfree webhook to process payment status (SUCCESS/FAILED)
router.post('/webhook', async (req, res) => {
    try {
        const ts = req.headers['x-webhook-timestamp'];
        const signature = req.headers['x-webhook-signature'];
        
        if (!ts || !signature) {
            return res.status(400).json({ message: 'Missing Cashfree webhook headers' });
        }

        const rawBody = req.rawBody;
        if (!rawBody) {
            return res.status(400).json({ message: 'Missing raw body. Ensure express.json is configured to store it.' });
        }

        // Verify webhook signature
        const data = ts + rawBody;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.CASHFREE_SECRET_KEY)
            .update(data)
            .digest('base64');

        if (expectedSignature !== signature) {
            console.error('Invalid Webhook Signature. Expected:', expectedSignature, 'Got:', signature);
            return res.status(403).json({ message: 'Invalid signature' });
        }

        const payload = req.body;
        console.log('Valid Cashfree Webhook Received:', payload.type);

        // Extract order_id from payload.data.order (Cashfree 2023-08-01 format)
        const cashfreeOrderId = payload.data?.order?.order_id || payload.data?.payment?.order_id;
        
        console.log('Webhook payload received. Extracted cashfreeOrderId:', cashfreeOrderId);
        
        if (!cashfreeOrderId) {
            console.error('Order ID not found in webhook payload:', JSON.stringify(payload));
            return res.status(200).json({ status: 'OK', message: 'Payload missing order_id' }); // Return 200 so cashfree stops retrying invalid payloads
        }

        // Process based on event type
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const { payment_status } = payload.data.payment || {};
            
            if (payment_status === 'SUCCESS') {
                const existingOrder = await prisma.order.findUnique({ where: { id: cashfreeOrderId } });
                
                if (!existingOrder) {
                    console.error(`Database order not found for cashfreeOrderId: ${cashfreeOrderId}`);
                    return res.status(404).json({ message: 'Order not found' });
                }
                
                console.log(`Database order found: ${existingOrder.id}`);

                if (existingOrder.isPaid) {
                    console.log(`Order ${cashfreeOrderId} already PAID. Idempotency check passed. Ignoring webhook.`);
                    return res.status(200).json({ status: 'OK' });
                }

                await prisma.order.update({
                    where: { id: cashfreeOrderId },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        status: 'PAID',
                        paymentResult: payload
                    }
                });
                console.log(`Order ${cashfreeOrderId} updated successfully`);
                console.log(`Webhook received -> Order ${cashfreeOrderId} updated -> Revenue updated`);
            }
        } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK' || payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
            const existingOrder = await prisma.order.findUnique({ where: { id: cashfreeOrderId } });
                
            if (existingOrder && !existingOrder.isPaid) {
                await prisma.order.update({
                    where: { id: cashfreeOrderId },
                    data: {
                        isPaid: false,
                        status: 'FAILED',
                        paymentResult: payload
                    }
                });
                console.log(`Webhook received -> Order ${cashfreeOrderId} marked as FAILED`);
            } else if (!existingOrder) {
                console.error(`Database order not found for failed cashfreeOrderId: ${cashfreeOrderId}`);
            }
        }

        // Always acknowledge webhook immediately with 200 OK
        res.status(200).json({ status: 'OK' });
    } catch (err) {
        console.error('Webhook Error:', err);
        res.status(500).json({ message: err.message });
    }
});

// @GET /api/payment/status/:orderId
// Safely check the order payment status from frontend
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { id: true, isPaid: true, status: true }
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ isPaid: order.isPaid, status: order.status });
    } catch (err) {
        console.error('Fetch Order Status Error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
