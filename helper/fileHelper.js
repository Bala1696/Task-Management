const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Task = require('../model/taskModel');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_BUCKET_REGION
});

const s3 = new AWS.S3();

// Multer S3 storage configuration for profile pictures
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        key: (req, file, cb) => {
            cb(null, `uploads/profile_picture/${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File Type Not Allowed'), false);
        }
    }
});

// Multer S3 storage configuration for task attachments
const taskUpload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        key: async (req, file, cb) => {
            try {
                const taskData = await Task.findById(req.params.id);
                if (!taskData) throw new Error('Task not found');

                const taskNumber = `${taskData.task_type}-${taskData.task_number}`;
                const fileName = `${Date.now()}_${file.originalname}`;
                const s3Key = `task/${taskNumber}/${fileName}`;

                taskData.attachments.push({ filename: fileName });
                await taskData.save();

                cb(null, s3Key);
            } catch (error) {
                cb(error);
            }
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = ['image/jpeg', 'image/jpg', 'application/pdf'];
        if (allowedFileTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File Type Not Allowed'), false);
        }
    }
});

module.exports = { upload, taskUpload };
