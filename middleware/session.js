const User = require('../model/userModel');

async function sessionStatus(req, res, next) {
    const exists = await User.findById(req.user.id);
    if(exists.is_loggedIn)
        next();
    else
        return false
}

module.exports={
    sessionStatus,
}

