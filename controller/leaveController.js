const User = require('../model/userModel');
const Leave = require('../model/leaveModel');

const resetLeave = async(req, res)=>{
    const {casualLeave, sickLeave, permission} = req.body;
    try{
        await User.updateMany({}, {$set:{casual_leave:casualLeave, sick_leave:sickLeave, permission:permission}});
        return res.status(200).json({message:'Leave updated'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const applyLeave = async (req, res) => {
    const { leaveType, startDate, endDate, startTime, endTime, reason, emergencyContact } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            const leaveBalance = user[leaveType];
            if (leaveBalance >= 1) {
                const start_date = Date.parse(startDate);
                const end_date = Date.parse(endDate);
                const start_time = startTime ? Date.parse(startTime) : null;
                const end_time = endTime ? Date.parse(endTime) : null;
                const oneDay = 24 * 60 * 60 * 1000;
                const total_days = Math.round(Math.abs((end_date - start_date) / oneDay)) + 1;
                const leaveApplication = await Leave.create({leave_type:leaveType, start_date, end_date, start_time, end_time, status:'pending', reason, total_days, emergency_contact:emergencyContact, applied_by:req.user.id});
                return res.status(200).json({ message: 'Leave applied', leaveApplication });
            } else {
                return res.status(400).json({ message: `No more ${leaveType}` });
            }
        } else {
            return res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};


const leaveRequest = async (req, res) => {
    try {
        const downLine = await User.find({ reporting_person: req.user.id });
        const leaveRequests = await Leave.find({ applied_by: { $in: downLine.map(user => user.id) } });
        if(leaveRequests){
            return res.status(200).json(leaveRequests);
        }
        return res.status(404).json({message:'No Leave requests found'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const approveLeave = async(req, res)=>{
    const leaveId = req.params.id;
    try{
        const exists = await Leave.findById(leaveId);
        if(exists){
            const userId = exists.applied_by;
            const leaveType = exists.leave_type;
            exists.status = 'approved';
            await exists.save();
            const userExists = await User.findById(userId);
            if(userExists){
                userExists[leaveType] -= exists.total_days;
                await userExists.save();
            }
            return res.status(301).json({message:'Leave Approved'});
        }
        return res.status(404).json({messsage:'User not Found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}



module.exports = {
    resetLeave,
    applyLeave,
    leaveRequest,
    approveLeave,
}