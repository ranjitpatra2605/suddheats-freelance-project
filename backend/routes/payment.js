const express = require('express');
const crypto = require('crypto');
const prisma = require('../models/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

const getCashfreeURL = () => {
    // FORCE LIVE MODE for production payment flow
    return 'https://api.cashfree.com/pg/orders';
};

// @POST /api/payment/create-order
// Create Cashfree order and return payment session id
router.post('/create-order', async (req, res) => {
    try {
        const { orderId, customer_phone, customer_email, customer_name } = req.body;
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

        const returnUrl = `${process.env.FRONTEND_URL || req.headers.origin || 'https://suddheats-freelance-project.vercel.app'}/payment/success?order_id={order_id}`;
        console.log(`[CASHFREE] Order Creation API called for DB order: ${orderId}, return_url: ${returnUrl}`);

        const finalPhone = customer_phone || (order.shippingAddress && order.shippingAddress.phone) || order.user.phone;

        const finalName = customer_name || (order.shippingAddress && order.shippingAddress.fullName) || order.user.name;

        if (!finalPhone || !/^[6-9]\d{9}$/.test(finalPhone.toString().trim())) {
            return res.status(400).json({ message: 'customer_details.customer_phone is missing or invalid in the request. A valid 10-digit Indian mobile number is required.' });
        }

        const cashfreePayload = {
            order_id: order.id,
            order_amount: order.totalPrice,
            order_currency: 'INR',
            customer_details: {
                customer_id: order.user.id,
                customer_phone: finalPhone.toString().trim(),
                customer_email: finalEmail,
                customer_name: finalName
            },
            order_meta: {
                return_url: returnUrl
            }
        };

        console.log('[CASHFREE] Request Payload:', JSON.stringify(cashfreePayload, null, 2));

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
            body: JSON.stringify(cashfreePayload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree Create Order Error:', data);
            return res.status(response.status).json({ message: data.message || 'Failed to create payment session' });
        }

        res.json({ payment_session_id: data.payment_session_id });
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
        const order_id = payload.data?.order?.order_id || payload.data?.payment?.order_id;

        console.log(`[CASHFREE WEBHOOK] Payload received. Extracted order_id: ${order_id}`);

        if (!order_id) {
            console.error('[CASHFREE WEBHOOK] Order ID not found in webhook payload:', JSON.stringify(payload));
            return res.status(200).json({ status: 'OK', message: 'Payload missing order_id' }); // Return 200 so cashfree stops retrying invalid payloads
        }

        // Process based on event type
        if (payload.type === 'PAYMENT_SUCCESS_WEBHOOK') {
            const { payment_status } = payload.data.payment || {};

            if (payment_status === 'SUCCESS') {
                const existingOrder = await prisma.order.findUnique({ where: { id: order_id } });

                if (!existingOrder) {
                    console.error(`[CASHFREE WEBHOOK] Database order not found for order_id: ${order_id}`);
                    return res.status(404).json({ message: 'Order not found' });
                }

                console.log(`[CASHFREE WEBHOOK] Database order found: ${existingOrder.id}`);

                if (existingOrder.isPaid) {
                    console.log(`[CASHFREE WEBHOOK] Order ${order_id} already PAID. Idempotency check passed. Ignoring webhook.`);
                    return res.status(200).json({ status: 'OK' });
                }

                console.log("Executing Prisma query...");
                await prisma.order.update({
                    where: { id: order_id },
                    data: {
                        isPaid: true,
                        paidAt: new Date(),
                        status: 'PAID',
                        paymentResult: payload
                    }
                });
                console.log("Database write successful");
                console.log(`[CASHFREE WEBHOOK SUCCESS] Order ${order_id} updated successfully. Revenue updated in real time.`);
            }
        } else if (payload.type === 'PAYMENT_FAILED_WEBHOOK' || payload.type === 'PAYMENT_USER_DROPPED_WEBHOOK') {
            const existingOrder = await prisma.order.findUnique({ where: { id: order_id } });

            if (existingOrder && !existingOrder.isPaid) {
                console.log("Executing Prisma query...");
                await prisma.order.update({
                    where: { id: order_id },
                    data: {
                        isPaid: false,
                        status: 'FAILED',
                        paymentResult: payload
                    }
                });
                console.log("Database write successful");
                console.log(`[CASHFREE WEBHOOK FAILED] Order ${order_id} marked as FAILED. Not marked as paid.`);
            } else if (!existingOrder) {
                console.error(`[CASHFREE WEBHOOK] Database order not found for failed order_id: ${order_id}`);
            }
        }

        // Always acknowledge webhook immediately with 200 OK
        res.status(200).json({ status: 'OK' });
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
