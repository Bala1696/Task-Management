const Functionality=require('../model/functionalityModel')
const Module =require('../model/moduleModel')

const addFunctionality = async (req, res) => {
    try {
        const { moduleId, functionality_name } = req.body;

        // Validate if module exists
        const moduleExists = await Module.findById(moduleId);
        if (!moduleExists) {
            return res.status(400).json({ error: 'Module not found' });
        }

        const newFunctionality = new Functionality({ module: moduleId, functionality_name });
        await newFunctionality.save();
        res.status(201).json(newFunctionality);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getFunctionality = async (req, res) => {
    try {
        const functionality = await Functionality.find().populate('module', 'module_name');
        res.status(200).json(functionality);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getFunctionalityById = async (req, res) => {
    try {
        const { id } = req.params;
        const functionality = await Functionality.findById(id).populate('module', 'module_name');
        if (!functionality) {
            return res.status(404).json({ error: 'Functionality not found' });
        }
        res.status(200).json(functionality);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateFunctionality = async (req, res) => {
    try {
        const { id } = req.params;
        const { moduleId, functionality_name } = req.body;
        const moduleExists = await Module.findById(moduleId);
        if (!moduleExists) {
            return res.status(400).json({ error: 'Module not found' });
        }

        const updatedFunctionality = await Functionality.findByIdAndUpdate(id, { module: moduleId, functionality_name }, { new: true, runValidators: true });
        if (!updatedFunctionality) {
            return res.status(404).json({ error: 'Functionality not found' });
        }
        res.status(200).json(updatedFunctionality);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deleteFunctionality = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFunctionality = await Functionality.findByIdAndDelete(id);
        if (!deletedFunctionality) {
            return res.status(404).json({ error: 'Functionality not found' });
        }
        res.status(200).json({ message: 'Functionality deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports={
    addFunctionality,
    getFunctionality,
    getFunctionalityById,
    updateFunctionality,
    deleteFunctionality
}