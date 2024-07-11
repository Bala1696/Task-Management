const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{type: String, default:null},
    password:{type:String, default:null},
    email:{type:String, required:true, unique:true},
    role:{type:String, required:true},
    org_id:{type:mongoose.Schema.Types.ObjectId, default:null},
    reporting_person:{type:mongoose.Schema.Types.ObjectId, default:null},
    filename:{type:String, default:null},
    filepath:{type:String, default:null},
    is_verified: { type: Boolean, default: false },
    is_loggedIn :{type:Boolean, default:false}
},
{
    timestamps:true
});

const user = mongoose.model('user', userSchema);

module.exports = user;
