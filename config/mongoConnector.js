const mongoose = require('mongoose');
require('dotenv').config()

 
mongoose.connect(process.env.DB_CONNECT);
console.log("Database Connected");


module.exports = mongoose;