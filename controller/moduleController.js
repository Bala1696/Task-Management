const Module = require('../model/moduleModel');

const addModule = async (req, res) => {
    const {module_name} = req.body
    try{
        const exists = await Module.findOne({module_name});
        if(exists){
            return res.status(400).json({message:'Modulename exists'})
        }else{
            await Module.create({module_name});
            return res.status(201).json({message:'ModuleName created'});
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getModule = async (req, res) => {
    try {
        const modules = await Module.find();
        res.status(200).json(modules);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getModuleById = async (req, res) => {
    try {
        const { id } = req.params;
        const module = await Module.findById(id);
        if (!module) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.status(200).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateModule = async (req, res) => {
    try {
        const { id } = req.params;
        const { module_name } = req.body;
        const updatedModule = await Module.findByIdAndUpdate(id, { module_name },{ new: true });
        if (!updatedModule) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.status(200).json(updatedModule);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteModule = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedModule = await Module.findByIdAndDelete(id);
        if (!deletedModule) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.status(200).json({ message: 'Module deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports={
    addModule,
    getModule,
    getModuleById,
    updateModule,
    deleteModule
}