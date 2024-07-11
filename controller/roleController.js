const Role = require('../model/roleModel');

const addRole = async(req, res)=>{
    const {name} = req.body
    try{
        const exists = await Role.findOne({name});
        if(exists){
            return res.status(400).json({message:'Role exists'})
        }else{
            await Role.create({name});
            return res.status(201).json({message:'Role created'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({error:'Internal server error'});
    }
}

const deleteRole = async(req, res)=>{
    const roleId = req.params.id;
    try{
        const exists = await Role.findById(roleId);
        if(exists){
            await exists.deleteOne();
            return res.status(200).json({message:'Role deleted'});
        }else{
            return res.status(404).json({message:'Role does not exists'});
        }
    }catch(error){
        return res.status(500).json({error:'Internal server error'});
    }
}
const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const role = await Role.findByIdAndUpdate(id, { name }, { new: true });
        if (role) {
            return res.status(200).json({message:'Role Updated'});
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        return res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await Role.findById(id);
        if (role) {
            return res.status(200).json(role);
        } else {
            res.status(404).json({ error: 'Role not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports={
    addRole,deleteRole,updateRole,getAllRoles,getRoleById
}