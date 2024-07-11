const mongoose = require('mongoose');

const functionalitySchema = new mongoose.Schema({
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    functionality_name: { type: String, required: true }
}, { strict: false });

const Functionality = mongoose.model('Functionality', functionalitySchema);

module.exports = Functionality;
