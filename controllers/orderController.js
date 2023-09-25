const Product = require('../models/Product');
const Order = require('../models/Order');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const fakeStripeApi = async ({ amount, currency }) => {
	const client_secret = 'Somerandomvalue';
	return { client_secret, amount };
};

const createOrder = async (req, res) => {
	const { items: cartItems, tax, shippingFee } = req.body;
	if (!cartItems || cartItems.length < 1) {
		throw new CustomError.BadRequestError('No order items present');
	}
	if (!tax || !shippingFee) {
		throw new CustomError.BadRequestError('Please add tax and shipping fee');
	}
	let orderItems = [];
	let subtotal = 0;
	for (const item of cartItems) {
		const dbProduct = await Product.findOne({ _id: item.product });
		if (!dbProduct) {
			throw new CustomError.NotFoundError(`No product with id: ${item.product}`);
		}
		const { name, price, image, _id } = dbProduct;
		const singleOrderItem = {
			name,
			price,
			image,
			amount: item.amount,
			product: _id
		};
		// add item to order
		orderItems.push(singleOrderItem);
		// calculate subtotal
		subtotal += price * item.amount;
	}
	// calculate total
	const total = tax + shippingFee + subtotal;

	// get client secret
	const paymentIntent = await fakeStripeApi({
		amount: total,
		currency: 'inr'
	});

	const order = await Order.create({
		orderItems,
		tax,
		shippingFee,
		subtotal,
		total,
		user: req.user.userId,
		clientSecret: paymentIntent.client_secret
	});
	res.status(StatusCodes.CREATED).json({ order, clientSecret: order.clientSecret });
};
const getAllOrders = async (req, res) => {
	const orders = await Order.find({});
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const getSingleOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const order = await Order.findOne({ _id: orderId });

	if (!order) {
		throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
	}
	checkPermissions(req.user, order.user);
	res.status(StatusCodes.OK).json({ order });
};
const getCurrentUserOrders = async (req, res) => {
	const orders = await Order.find({ user: req.user.userId });
	res.status(StatusCodes.OK).json({ orders, count: orders.length });
};
const updateOrder = async (req, res) => {
	const { id: orderId } = req.params;
	const { paymentIntentId } = req.body;
	const order = await Order.findOne({ _id: orderId });
	if (!order) {
		throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
	}
	checkPermissions(req.user, order.user);
	order.paymentId = paymentIntentId;
	order.status = 'paid';
	await order.save();
	res.status(StatusCodes.OK).json({ order });
};

module.exports = {
	getAllOrders,
	getSingleOrder,
	getCurrentUserOrders,
	createOrder,
	updateOrder
};
