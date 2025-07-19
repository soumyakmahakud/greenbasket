import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Razorpay from 'razorpay';

//Place Order COD : /api/order/cod
export const placeOrderCOD = async (req, res) => {
    try {
        const { userId, items, address } = req.body
        if (!address || items.length === 0) {
            return res.json({ success: false, message: 'Invalid data' })
        }
        //Calculate amout using items
        let amount = await items.reduce(async (acc, item) => {
            const product = await Product.findById(item.product);
            return (await acc) + product.offerPrice * item.quantity;
        }, 0)

        //Add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'COD',
        });
        return res.json({ success: true, message: "Order Placed Successfully" })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })

    }
}
//Place Order stripe : /api/order/razorpay
export const placeOrderRazorpay = async (req, res) => {
    try {
        const { userId, items, address } = req.body
        if (!address || items.length === 0) {
            return res.json({ success: false, message: 'Invalid data' })
        }

        // Calculate total amount
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
        }

        //Add tax charge (2%)
        amount += Math.floor(amount * 0.02);

        // Create order in DB
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: 'online',
        });

        // Initialize Razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });


        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amount * 100, // in paisa
            currency: 'INR',
            receipt: `order_rcptid_${order._id}`,
            notes: {
                orderId: order._id.toString(),
                userId
            }
        });

        return res.json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })

    }
}

//Razorpay Webhooks to Verify Payments Action : /razorpay
export const razorpayWebhook = async (req, res) => {
    // Razorpay Gateway Initialize
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    //Verify Razorpay webhook signature
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');

    if (expectedSignature !== signature) {
        return res.status(400).send('Invalid signature');
    }

    // Process Razorpay event

    const event = req.body.event;
    const payment = req.body.payload?.payment?.entity;

    if (event === 'payment.captured') {
        const orderId = payment.notes?.orderId;
        const userId = payment.notes?.userId;


        try {
            // Optional: Mark the order as paid (or update any existing field like `paymentType`)
            await Order.findByIdAndUpdate(orderId, {
                $set: {
                    paymentType: 'online-paid' // Only if field already exists
                }
            });
            return res.status(200).json({ success: true, message: 'Payment processed' });


        } catch (error) {
            console.error('❌ Failed to update order:', err.message);
            return res.status(500).json({ success: false, message: 'Failed to update order' });
        }
    }
    res.json({ received: true })
}

//Get Orders by User Id : /api/order/user
export const getUserOrder = async (req, res) => {
    try {
        const { userId } = req.query;
        const orders = await Order.find({
            userId,
            $or: [{ paymentType: "COD" },
            { paymentType: "online" },
            { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })

        res.json({ success: true, orders })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}

//Get all Oreders (for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [{ paymentType: "COD" }, { isPaid: true }]
        }).populate("items.product address").sort({ createdAt: -1 })

        res.json({ success: true, orders })
    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
} 