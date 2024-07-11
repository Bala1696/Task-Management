const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    leave_type: { type: String, enum: ['casual_leave', 'sick_leave', 'permission'], required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, default: null },
    start_time: { type: Date, default: null },
    end_time: { type: Date, default: null },
    status: { type: String, default: 'pending' },
    reason: { type: String, required: true },
    total_days: { type: Number, default: null },
    emergency_contact: { type: Number, required: true },
    applied_by: { type: mongoose.Schema.Types.ObjectId, required: true }
}, {
    timestamps: true
});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave;
