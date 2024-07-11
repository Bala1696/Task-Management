const mongoose = require('mongoose');

const timesheetSchema = new mongoose.Schema({
    date: { type: String, default:null },
    user_id: { type: mongoose.Schema.Types.ObjectId, default:null},
    worked_hours: { type: String, default:null },
    in_time: { type: String, default:null },
    out_time: { type: String, default:null }
});
timesheetSchema.index({ date: 1 }, { unique: false });

const Timesheet = mongoose.model('Timesheet', timesheetSchema);

module.exports = Timesheet;
