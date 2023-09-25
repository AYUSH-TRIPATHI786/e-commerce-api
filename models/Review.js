const mongoose = require('mongoose');

const ReviewSchema = mongoose.Schema(
	{
		rating: {
			type: Number,
			required: [true, 'Please provide rating'],
			min: 1,
			max: 5
		},
		title: {
			type: String,
			trim: true,
			required: [true, 'Please provide review'],
			minLength: 3,
			maxLength: 100
		},
		comment: {
			type: String,
			trim: true,
			required: [true, 'Please provide comment'],
			minLength: 3,
			maxLength: 1000
		},
		user: {
			type: mongoose.Types.ObjectId,
			ref: 'User',
			required: [true, 'Please provide userId']
		},
		product: {
			type: mongoose.Types.ObjectId,
			ref: 'Product',
			required: [true, 'Please provide productId']
		}
	},
	{ timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateAverageRating = async function (productId) {
	const result = await this.aggregate([
		{
			$match: {
				product: productId
			}
		},
		{
			$group: {
				_id: null,
				averageRating: {
					$avg: '$rating'
				},
				numOfReviews: {
					$sum: 1
				}
			}
		}
	]);
	try {
		await this.model('Product').findOneAndUpdate(
			{ _id: productId },
			{ numOfReviews: result[0]?.numOfReviews || 0, averageRating: Math.ceil(result[0]?.averageRating || 0) }
		);
	} catch (error) {
		console.log(error);
	}
};

ReviewSchema.post('save', async function () {
	await this.constructor.calculateAverageRating(this.product);
});
ReviewSchema.post('deleteOne', { document: true, query: false }, async function () {
	await this.constructor.calculateAverageRating(this.product);
});
module.exports = mongoose.model('Review', ReviewSchema);
