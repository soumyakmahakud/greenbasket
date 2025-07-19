import express from 'express';
import authUser from '../middleware/authUser.js';
import { getAllOrders, getUserOrder, placeOrderCOD, placeOrderRazorpay } from '../controllers/orderController.js';
import authSeller from '../middleware/authSeller.js';

const orderRouter = express.Router();

orderRouter.post('/cod', authUser, placeOrderCOD)
orderRouter.get('/user', authUser, getUserOrder)
orderRouter.get('/seller', authSeller, getAllOrders)
orderRouter.post('/razorpay', authUser, placeOrderRazorpay)

export default orderRouter;