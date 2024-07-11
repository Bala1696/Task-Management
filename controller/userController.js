const {passcrypt, compass} = require('../helper/passwordHelper');
const {generateToken,generateRefreshToken} = require('../helper/tokenHelper');
const emailHelper = require('../helper/emailHelper');
const fs = require('fs').promises;
const User = require('../model/userModel');
const Permission= require('../model/permissionModel')
const Role= require('../model/roleModel')
const jwt = require('jsonwebtoken');
const Timesheet = require('../model/timesheetModel');
const {jwtDecode} = require('jwt-decode');
const Jimp = require('jimp');
const path = require('path');
const { ObjectId } = require('mongodb')
require('dotenv').config();


const register = async (req, res) => {
    const { firstName, lastName, password, email } = req.body;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    let adminCreator, adminData = null;
    try {
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ error: 'Invalid Password. It must have at least 8 characters, 1 uppercase letter, 1 special character, and 1 number.' });
        }
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(409).json({ error: 'User Already Exists' });
        }
        const encryptedPassword = await passcrypt(password, process.env.SALT_ROUNDS);
        const srcImagePath = path.join(__dirname, '..', 'uploads/profile_picture', 'avatar.png');
        const destImagePath = path.join(__dirname, '..', 'uploads/profile_picture', `${firstName}.${lastName}.jpg`)
        const defaultImgName = await addDefaultImage(firstName, lastName, srcImagePath, destImagePath);
        const username = firstName + '.' + lastName;
        const adminRole = await Role.findOne({ name: 'admin' });
        if (!adminRole) {
            adminCreator = await Role.create({name:'admin'});
        }
        (adminCreator === undefined) ? adminData = adminRole.id : adminData = adminCreator.id;
        const newUser = await User.create({ firstName, lastName, username:username, password: encryptedPassword, email, role: adminData, filename:defaultImgName, filepath:`uploads/profile_picture/${defaultImgName}`,is_verified: false  });
        const token = generateToken({ username, email });
        const verificationUrl = process.env.VERIFICATION + token;
        emailHelper.verificationEmail(email, verificationUrl, username);
        return res.status(201).json({ message: 'User Created', user: newUser });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const resendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.is_verified) {
            return res.status(400).json({ error: 'User is already verified' });
        }
        const token = jwt.sign({ username: user.username, email: user.email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        const verificationUrl = `${process.env.VERIFICATION_URL}?token=${token}`;
        emailHelper.verificationEmail(email, verificationUrl, user.username);
        return res.status(200).json({ message: 'Verification email sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        let timesheetExists = null;
        let orgFlag = true;
        const exists = await User.findOne({email});
        if (exists) {
            if (!exists.is_verified) {
                return res.status(403).json({ message: 'Please verify your email before logging in.' });
            }
            const comparePassword = await compass(password, exists.password);
            if (comparePassword) {
                const accessToken = generateToken({ role: exists.role, id: exists.id, org: exists.org_id });
                const refreshToken = generateRefreshToken({ role: exists.role, id: exists.id, org: exists.org_id });
                req.session.accessToken = accessToken;
                req.session.refreshToken = refreshToken;
                const pipeline = [
                    {
                        $lookup: {
                            from: 'modules',
                            localField: 'permissions.module_id',
                            foreignField: '_id',
                            as: 'modules'
                        }
                    },
                    {
                        $match: { role: ObjectId.createFromHexString(exists.role) }
                    }
                ];
                const permissions = await Permission.aggregate(pipeline);
                if (exists.org_id) {
                    orgFlag = false;
                }
                const timezone = { hour12: false, timeZone: 'Asia/Kolkata' };
                const currentDate = new Date().toISOString().split('T')[0];
                const currentTime = new Date().toLocaleTimeString('en-IN', timezone);
                timesheetExists = await Timesheet.findOne({$and:[{date:currentDate}, {user_id:exists.id}]});
                if(timesheetExists == null || timesheetExists == undefined){
                    await Timesheet.create({ date: currentDate, user_id: exists.id, in_time: currentTime, out_time: currentTime, worked_hours: 0 });
                }
                await exists.updateOne({$set:{is_loggedIn:true}});
                return res.status(200).json({ accessToken,refreshToken, username: exists.username, permissions,isOrgIdRequired: orgFlag});
            }
        }
        return res.status(404).json({message:'User Not Found'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }
    try {
        const userId = req.user.id;
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const newAccessToken = generateToken({ id: user._id, username: user.username });
        const newRefreshToken = generateRefreshToken({ id: user._id });
        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken ,user:user});
    } catch (error) {
        console.error('Error refreshing token:', error);
        return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
}

const forgetPassword = async(req, res)=>{
    const {email} = req.body;
    try{
        const token = generateToken({email:email});
        const exists = await User.findOne({email:email});
        const url = process.env.FORGET_PASSWORD+token;
        await emailHelper.passwordReset(email, url, exists.username);
        return res.status(200).json({message:'Password reset link sent'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const resetPassword = async(req, res)=>{
    const {token, password} = req.body;
    try{
        decodedToken = jwtDecode(token);
        if (!decodedToken) {
            return res.status(400).json({message:'Invalid token'});
        }
        const emailId = decodedToken.payload.email;
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({message:'Invalid Password. It must have at least 8 characters, 1 uppercase letter, 1 special character, and 1 number.'});
        }
        const encryptedPassword = await passcrypt(password, process.env.SALT_ROUNDS);
        await User.updateOne({email:emailId},{$set:{password:encryptedPassword}});
        return res.status(200).json({message:'Password updated'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const sendInvite = async (req, res) => {
    const { to } = req.body;
    let viewerCreator, viewerData = null;
    try {
        const userExists = await User.findOne({ email: to });
        if (userExists) {
            return res.status(403).json({ message: 'User already exists' });
        }
        const viewerRole = await Role.findOne({ name: 'viewer' });
        if (!viewerRole) {
            viewerCreator = await Role.create({name:'viewer'});
        }
        (viewerCreator === undefined) ? viewerData = viewerRole.id : viewerData = viewerCreator.id;
        const token = generateToken(req.user.org_id);
        const url = `${process.env.SEND_INVITE}${token}`;
        await emailHelper.inviteMail(to, url);
        await User.create({ email: to, role: viewerData, is_verified: true });
        return res.status(200).json({ message: 'Invite sent' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

const inviteUser = async(req, res)=>{
    const {firstName, lastName, email, password} = req.body;
    const tokens = req.query.token;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    try{
        const exists = await User.findOne({email});
        if (!passwordRegex.test(password))
            return res.status(400).json({message:'Invalid Password. It must have at least 8 characters, 1 uppercase letter, 1 special character, and 1 number.'});
        const decodedToken = jwtDecode(tokens);
        if (!decodedToken)
            return res.status(400).json({message:'Invalid token'});
        const orgId = decodedToken.payload;
        const encryptedPassword = await passcrypt(password, process.env.SALT_ROUNDS);
        const srcImagePath = path.join(__dirname, '..', 'uploads/profile_picture', 'avatar.png');
        const destImagePath = path.join(__dirname, '..', 'uploads/profile_picture', `${firstName}.${lastName}.jpg`)
        const defaultImgName = await addDefaultImage(firstName, lastName, srcImagePath, destImagePath);
        const username = firstName + '.' + lastName;
        if(exists){
            await User.findOneAndUpdate({email:email},{$set:{ username:username, password: encryptedPassword, org_id:orgId, filename:defaultImgName, filepath:`uploads/profile_picture/${defaultImgName}`} });
            return res.status(201).json({ message: 'User Created'});
        }else
            return res.status(404).json({message:'No user found invited'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const uploadDp = async(req, res)=>{
    const userId = req.user.id;
    try{
        const exists = await User.findById(userId);
        if(exists){
            const existingImagePath = process.env.EXISTING_IMAGE_PATH + exists.filepath;
            await fs.unlink(existingImagePath);
            await exists.updateOne({$set:{filename: req.file.originalname, filepath: 'uploads/profile_picture/' + `${req.file.originalname}`}});
            if(req.file.size <= 1024 * 1024){
                return res.status(200).json({message:'Image Uploaded'});
            }else{
                return res.status(400).json({message:'Image Size too Large'});
            }
        }
        return res.status(404).json({message:'User not Found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const getDp = async(req, res)=>{
    try{
        const userId = req.user.id;
        const exists = await User.findById(userId);
        if(exists){
            const imgLink = 'https://localhost:1731/' + exists.filepath;
            return res.status(200).json({message:imgLink}); 
        }
        return res.status(404).json({message:'User not Found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const assignReportingPerson = async(req, res)=>{
    const {userId, reportingPersonId} = req.body;
    try{
        const exists = await User.findById(reportingPersonId);
        if(exists){
            await User.updateMany({_id:userId},{reporting_person:reportingPersonId});
            return res.status(301).json({message:'Reporting Persons assigned'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const exists = await Timesheet.findOne({ user_id: req.user.id, date: new Date().toISOString().split('T')[0]});
            if (exists) {
                const currentTime = new Date().toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' });
                await exists.updateOne({$set:{out_time:currentTime}});
            }
            await User.updateOne({_id:req.user.id},{is_loggedIn:false});
            res.status(200).json({message:'User LoggedOut'});
        }
        await tsWorkedHrs(req.user.id);
    } catch (error) {
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const verifyEmail = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(400).json({ error: 'Token is missing' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const email = decoded.email;
        const userData = await User.findOne(email);
        if (!userData)
            return res.status(400).json({ error: 'Invalid token or user not found' });
        if (userData.is_verified)
            return res.status(400).json({ error: 'User is already verified' });
        userData.is_verified = true;
        await userData.save();
        return res.status(200).json({ message: 'Email successfully verified' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function tsWorkedHrs(id) {
    const exists = await Timesheet.findOne({ user_id: id, date: new Date().toISOString().split('T')[0] });
    if (exists) {
        const outTime = exists.out_time.split(':');
        const inTime = exists.in_time.split(':');
        let outTimeHrs = (outTime[0]);
        let outTimeMin = (outTime[1]);
        let inTimeHrs = (inTime[0]);
        let inTimeMin = (inTime[1]);
        let hrs = outTimeHrs - inTimeHrs;
        let min = outTimeMin - inTimeMin;
        if (min < 0) {
            min += 60;
            hrs -= 1;
        }
        const formattedHrs = hrs < 10 ? `0${hrs}` : hrs;
        const formattedMin = min < 10 ? `0${min}` : min;
        let timeDiff = formattedHrs + ':' + formattedMin;
        await exists.updateOne({ $set: { worked_hours: timeDiff } });
    }
}

async function addDefaultImage(firstName, lastName, srcImagePath, destImagePath) {
    try{
        const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
        const image = await Jimp.read(srcImagePath);
        const firstLetterFirstName = firstName.charAt(0).toUpperCase();
        const firstLetterLastName = lastName.charAt(0).toUpperCase();
        const initials = firstLetterFirstName + firstLetterLastName;
        image.print(font,20,32,initials);
        await image.writeAsync(destImagePath);
        return `${firstName}.${lastName}.jpg`;
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal server error'});
    }
}



module.exports={
    register,
    login,
    refreshToken,
    forgetPassword,
    resetPassword,
    sendInvite,
    inviteUser,
    uploadDp,
    getDp,
    assignReportingPerson,
    logout,
    verifyEmail,
    resendVerificationEmail
}