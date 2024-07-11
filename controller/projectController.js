const Project = require('../model/projectModel');
const Task = require('../model/taskModel');
const Comment = require('../model/commentModel');
const fileHelper = require('../helper/fileHelper');

const createProject = async(req, res)=>{
    const {projectName} = req.body;
    try{
        const exists = await Project.findOne({project_name:projectName});
        if(exists)
            return res.status(409).json({message:'Record exists'});
        else{
            const newProject = await Project.create({project_name:projectName, created_by:req.user.id, org_id:req.user.org_id});
            return res.status(200).json({message:'Project Created', newProject});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const getAllProjects = async(req, res) => {
    try{
        const exists = await Project.find({created_by:req.user.id}).sort({createdAt:-1});
        if(exists)
            return res.status(200).json(exists);
        else
            return res.status(404).json({message:'No projects found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    } 
}

const updateProject = async (req, res)=>{
    const projectId = req.params.id;
    const{projectName} = req.body;
    try{
        const exists = await Project.findById(projectId);
        if(exists){
            await exists.updateOne({$set:{project_name:projectName}});
            return res.status(301).json({message:'Project Updated'});
        }else
            return res.status(404).json({message:'No Projects Found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const deleteProject = async (req, res)=>{
    const projectId = req.params.id;
    try{
        const exists = await Project.findById(projectId);
        if(exists){
            const associatedTask = await Task.find({project_id:projectId});
            for(let key of associatedTask){
                fileHelper.deleteDirectory(process.env.EXISTING_IMAGE_PATH + key.filepath);
            }
            await Task.deleteMany({project_id:projectId});
            await Comment.deleteMany({project_id:projectId});
            await exists.deleteOne();
            return res.status(200).json({message:'Project Deleted'});
        }else
            return res.status(404).json({message:'No Project Found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const getProjectDataById = async(req, res)=>{
    const projectId = req.params.id;
    const {page, limit} = req.body;
    const skip = (page - 1) * limit;
    try{
        const pagination = await Task.find({project_id:projectId}).skip(skip).limit(limit);
        if(pagination.length > 0){
            const totalData = await Task.countDocuments({project_id:projectId});
            const totalPages = Math.ceil(totalData/limit);
            let endIndex = (page * limit);
            (endIndex > totalData) ? endIndex = totalData : endIndex;
            const startIndex = endIndex - ((limit - 10) + 9);
            const displayData = [{'startIndex':startIndex, 'endIndex':endIndex}];
            return res.status(200).json({pagination, totalPages, limit, page, totalData, displayData});
        }else
            return res.status(404).json({message:'No tasks found'});
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal server error'});
    }
}





module.exports={
    createProject,
    getAllProjects,
    updateProject,
    deleteProject,
    getProjectDataById
}