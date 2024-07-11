const jwt = require('jsonwebtoken');
require ('dotenv').config();

const generateToken = (payload) =>{
    const token = jwt.sign({ payload, expiresIn: '30m' }, process.env.SECRET_KEY);
    return token;
}
const generateRefreshToken = (data) => {
    const token = jwt.sign(data, process.env.JWT_REFRESH_TOKEN, {expiresIn : "1d"})

    return token;
}

module.exports = {
    generateToken,
    generateRefreshToken
};
