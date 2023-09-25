const jwt = require('jsonwebtoken');
const CustomError = require('../errors');
const { isTokenValid } = require('../utils');

const authenticateUser = async (req, res, next) => {
	// ### FOR LOCAL STORAGE

	// const authHeader = req.headers.authorization;
	// if (!authHeader?.startsWith('Bearer ')) {
	// 	throw new CustomError.UnauthenticatedError('Authentication Invalid');
	// }
	// const accessToken = authHeader.split(' ')[1];

	// ### FOR COOKIES

	const accessToken = req.signedCookies?.token;
	// console.log(req.signedCookies);
	if (!accessToken) {
		throw new CustomError.UnauthenticatedError('Authentication Invalid');
	}

	try {
		const payload = isTokenValid({ token: accessToken });
		// console.log(payload);
		if (!payload) {
			throw new CustomError.UnauthenticatedError('Authentication Invalid');
		}
		req.user = { userId: payload.userId, name: payload.name, role: payload.role };
		next();
	} catch (error) {
		throw new CustomError.UnauthenticatedError('Authentication Invalid');
	}
};

const authorizePermissions = (...roles) => {
	return async (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomError.UnauthorizedError('Unauthorized to access this route');
		}
		next();
	};
};

module.exports = { authenticateUser, authorizePermissions };
