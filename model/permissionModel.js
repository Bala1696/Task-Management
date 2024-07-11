const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Role',
        required: true,
    },
    permissions: [{
        module_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Functionality',
            required: true,
        },
        allowed: {
            type: Boolean,
            required: true
        },
        functionalities: [{
            functionality_name: {
                type: String,
                required: true
            },
            allowed: {
                type: Boolean,
                required: true
            }
        }]
    }]
}, { timestamps: true });

const Permission = mongoose.model('Permission',permissionSchema);

module.exports = Permission;
