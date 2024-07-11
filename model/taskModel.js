const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const taskSchema = new mongoose.Schema({
    task_type: { type: String, enum: ['bug', 'cr'], required: true },
    task_title: { type: String, required: true },
    project_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    description: { type: String, default:null },
    notes: { type: String, default:null },
    attachments: [{ 
        filename:{type: String, default:null},
    }],
    filepath:{type:String, default:null},
    created_by: { type: mongoose.Schema.Types.ObjectId, required: true },
    assigned_to: { type: mongoose.Schema.Types.ObjectId, default:null },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default:null},
    effort_estimation: { type: String, default:null },
    status: { type: String, enum: ['completed', 'on_hold', 'accepted', 'unassigned'], default:null},
    release_version: { type: String, default:null },
    start_date: { type: String, default:null },
    parent_task:{type:mongoose.Schema.Types.ObjectId, default:null},
}, {
    timestamps: true
});

taskSchema.plugin(autoIncrement, { inc_field: 'task_number' });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;