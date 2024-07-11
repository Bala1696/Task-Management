const mongoose = require('mongoose');

const orgSchema = new mongoose.Schema({
    org_name:{type:String, required:true},
    org_type:{type: String, required:true},
    org_prefix:{type:String, required:true}
},
{
    timestamps:true
});

const org = mongoose.model('org', orgSchema);

module.exports = org;