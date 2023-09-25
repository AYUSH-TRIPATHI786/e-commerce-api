const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const createReview = async (req, res) => {
	const { product: productId } = req.body;
	const isProductExists = await Product.find({ _id: productId });
	if (!isProductExists) {
		throw new CustomError.NotFoundError(`No product found with id: ${productId}`);
	}
	const alreadyExists = await Review.findOne({ product: productId, user: req.user.userId });
	if (alreadyExists) {
		throw new CustomError.BadRequestError('Already submitted a review for this product');
	}

	req.body.user = req.user.userId;
	const review = await Review.create(req.body);
	res.status(StatusCodes.OK).json({ review });
};
const getAllReviews = async (req, res) => {
	const reviews = await Review.find({})
		.populate({ path: 'product', select: 'name company price' })
		.populate({ path: 'user', select: 'name' });
	res.status(StatusCodes.OK).json({ reviews });
};
const getSingleReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId }).populate({
		path: 'product',
		select: 'name company price'
	});
	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
	}
	res.status(StatusCodes.OK).json({ review });
};
const updateReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
	}
	checkPermissions(req.user, review.user);
	const { rating, title, comment } = req.body;
	review.rating = rating;
	review.title = title;
	review.comment = comment;
	await review.save();
	res.status(StatusCodes.OK).json({ review });
};
const deleteReview = async (req, res) => {
	const { id: reviewId } = req.params;
	const review = await Review.findOne({ _id: reviewId });
	if (!review) {
		throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
	}
	checkPermissions(req.user, review.user);
	await review.deleteOne();
	res.status(StatusCodes.OK).json({ msg: 'Review deleted successfully' });
};

const getSingleProductReviews = async (req, res) => {
	const { id: productId } = req.params;
	const reviews = await Review.find({ product: productId });
	res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

module.exports = {
	createReview,
	getAllReviews,
	getSingleReview,
	updateReview,
	deleteReview,
	getSingleProductReviews
};
