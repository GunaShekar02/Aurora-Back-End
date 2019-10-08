const jwt = require('jsonwebtoken');
require('dotenv').config();

const secret = process.env.JWT_TOKEN;

const provideContext = (request) => {
	const req = request.req;
	var payload = {
		isValid: false,
		token: null,
    email: null,
    id: null,
	};
	let authHeader = req.headers.authorization || null;

	if(authHeader){
		const token = authHeader.replace('bearer ','');

		jwt.verify(token, secret, (err, decoded) => {
			if(!err){
        payload.isValid = true;
        payload.token = token;
        payload.email = decoded.email;
        payload.id = decoded.id;
			}
		});
	}
  return payload;
}

module.exports = provideContext;