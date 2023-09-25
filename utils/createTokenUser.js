const createTokenUser = ({ _id, name, role }) => {
	return {
		userId: _id,
		name,
		role
	};
};

module.exports = createTokenUser;
