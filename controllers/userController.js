const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { createTokenUser, attachCookiesToResponse } = require('../utils');
const { checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
	const users = await User.find({ role: 'user' }).select('-password');
	res.status(StatusCodes.OK).json({ users });
};
const getSingleUser = async (req, res) => {
	const user = await User.findOne({ _id: req.params.id }).select('-password');
	checkPermissions(req.user, user._id);
	res.status(StatusCodes.OK).json({ user });
};
const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};
// Update user using save()
const updateUser = async (req, res) => {
	const { name, email } = req.body;
	if (!name || !email) {
		throw new CustomError.BadRequestError('Please provide name and email.');
	}
	const user = await User.findOne({ _id: req.user.userId });
	user.name = name;
	user.email = email;
	await user.save();
	const tokenUser = createTokenUser(user);
	attachCookiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.OK).json({ user: tokenUser });
};
const updateUserPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new CustomError.BadRequestError('Please provide old and new passwords.');
	}
	const user = await User.findOne({ _id: req.user.userId });
	if (!user) {
		throw new CustomError.UnauthenticatedError('User not found.');
	}

	const isValidPassword = user.comparePassword({ oldPassword });
	if (!isValidPassword) {
		throw new CustomError.UnauthenticatedError('Incorrect Password');
	}
	user.password = newPassword;
	await user.save();
	res.status(StatusCodes.OK).json({ msg: 'Password Updated Successfully' });
};

module.exports = { getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword };

// ### Update user using findOneAndUpdate

// const updateUser = async (req, res) => {
// 	const { name, email } = req.body;
// 	if (!name || !email) {
// 		throw new CustomError.BadRequestError('Please provide name and email.');
// 	}
// 	const user = await User.findOneAndUpdate(
// 		{ _id: req.user.userId },
// 		{ name, email },
// 		{ new: true, runValidators: true }
// 	);
// 	const tokenUser = createTokenUser(user);
// 	attachCookiesToResponse({ res, user: tokenUser });
// 	res.status(StatusCodes.OK).json({ user: tokenUser });
// };
