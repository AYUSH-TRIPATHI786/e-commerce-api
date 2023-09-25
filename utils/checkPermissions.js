const CustomError = require('../errors');

const checkPermissions = (requestingUser, resourceUserId) => {
	// console.log(requestingUser);
	// console.log(resourceUserId);
	// console.log(typeof resourceUserId);
	if (requestingUser.role === 'admin') return;
	if (requestingUser.userId === resourceUserId.toString()) return;
	throw new CustomError.UnauthorizedError('Not authorized to access this route');
};

module.exports = checkPermissions;
