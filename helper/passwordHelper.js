const bcrypt = require('bcrypt');
const saltRounds = 10;

const passcrypt = async (password) => {
    return await bcrypt.hash(password, saltRounds);
}

const compass = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
}

module.exports = {
    passcrypt,
    compass,
}
