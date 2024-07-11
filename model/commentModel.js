const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    comment:{type:String, required:true},
    user_id:{type:mongoose.Schema.Types.ObjectId, required:true},
    task_id:{type:mongoose.Schema.Types.ObjectId, required:true},
    project_id:{type:mongoose.Schema.Types.ObjectId, required:true}
},
{
    timestamps:true
});

const comment = mongoose.model('comment', commentSchema);

module.exports = comment;