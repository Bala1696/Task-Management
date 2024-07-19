const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../model/taskModel');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION
});

const s3 = new AWS.S3();

// Multer configuration for temporary file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile_picture');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('File Type Not Allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

const uploadToS3 = async (filePath, s3Key) => {
    const fileContent = fs.readFileSync(filePath);
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: s3Key,
        Body: fileContent,
        ACL: 'public-read'
    };
    await s3.upload(params).promise();
    fs.unlinkSync(filePath); // Remove the file from the server after upload
};

const taskUpload = upload.single('taskFile'); // Assuming a single file upload for task attachments

const handleTaskUpload = async (req, res) => {
    try {
        const taskData = await Task.findById(req.params.id);
        if (!taskData) {
            throw new Error('Task not found');
        }

        const file = req.file;
        const taskNumber = `${taskData.task_type}-${taskData.task_number}`;
        const s3Key = `task/${taskNumber}/${file.filename}`;

        await uploadToS3(file.path, s3Key);

        const attachment = { filename: file.filename, filepath: s3Key };
        taskData.attachments.push(attachment);
        await taskData.save();

        res.status(200).json({ message: 'File uploaded successfully', attachment });
    } catch (error) {
        console.error('Error in task file upload:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = { upload, taskUpload, handleTaskUpload };
