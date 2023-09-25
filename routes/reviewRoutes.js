const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/authentication');

const {
	getAllReviews,
	createReview,
	getSingleReview,
	updateReview,
	deleteReview
} = require('../controllers/reviewController');

router.route('/').get(getAllReviews).post(authenticateUser, createReview);
router
	.route('/:id')
	.get(getSingleReview)
	.patch(authenticateUser, updateReview)
	.delete(authenticateUser, deleteReview);

module.exports = router;
