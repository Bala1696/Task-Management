const Org = require('../model/orgModel');
const User = require('../model/userModel');

const createOrg = async(req, res)=>{
    const {orgName, orgType, orgPrefix} = req.body;
    try{
        const exists = await Org.findOne({org_name:orgName});
        if(exists){
            return res.status(400).json({message:'Org Exists'});
        }else{
            const creator = await Org.create({org_name:orgName, org_type:orgType, org_prefix:orgPrefix});
            const updateExists = await User.findById(req.user.id);
            if(updateExists){
                await updateExists.updateOne({$set:{org_id: creator.id}});
            }
            res.status(200).json({message:'Org Created', creator});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const getOrg = async (req, res)=>{
    try{
        const userExists = await User.findById(req.user.id);
        const orgExists = await Org.findById(userExists.org_id);
        if(orgExists){
            return res.status(200).json(orgExists);
        }else{
            return res.status(400).json({message:'Org not Found'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal Server Error'});
    }
}

const updateOrg = async(req, res)=>{
    const orgId = req.params.id;
    const {orgName, orgType, orgPrefix} = req.body;
    try{
        const exists = await Org.findById(orgId);
        if(exists){
            await exists.updateOne({$set:{org_name:orgName, org_type:orgType, org_prefix:orgPrefix}});
            return res.status(204).json({message:'Org updated'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal server error'});
    }
}

const deleteOrg = async(req, res)=>{
    const orgId = req.params.id;
    try{
        const exists = await Org.findById(orgId);
        if(exists){
            await exists.deleteOne();
            const orgUsers = await User.find({org_id:orgId});
            for(let key of orgUsers){
                key.org_id = null;
                await key.save();
            }
            const orgProjects = await User.find({org_id:orgId});
            for(let key of orgProjects){
                key.org_id = null;
                await key.save();
            }
            return res.status(200).json({message:'Org deleted'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal server error'});
    }
}

module.exports = {
    createOrg,
    getOrg,
    updateOrg,
    deleteOrg,
}
