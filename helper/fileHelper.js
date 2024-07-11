const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Task = require('../model/taskModel');

const createDirectory = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

const deleteDirectory = (dirPath) =>{
    if(fs.existsSync(dirPath)){
        fs.rmdirSync(dirPath, {recursive: true});
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_picture');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const taskStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const taskData = await Task.findById(req.params.id);
        if (!taskData)
            throw new Error('Task not found');
        const taskNumber = taskData.task_type + '-' + taskData.task_number;
        const uploadPath = path.join('uploads/task', taskNumber);
        createDirectory(uploadPath);
        const attachment = {
            filename: Date.now() + '_' + file.originalname,
        };
        taskData.attachments.push(attachment);
        await taskData.save();
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

const fileFilter = async(req, file, cb)=>{  
    const allowedFileType = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if(allowedFileType.includes(file.mimetype)){
        cb(null, true);
    }else{
        cb(new Error('File Type Not Allowed'), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});
const taskUpload = multer({
    storage: taskStorage,
    fileFilter: fileFilter
});

module.exports = { upload, taskUpload, deleteDirectory };
