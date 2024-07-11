
const mongoose = require('mongoose');
const Permission= require('../model/permissionModel')
const Role= require('../model/roleModel')
const Functionality= require('../model/functionalityModel')
const Module= require('../model/moduleModel')

const addPermission = async (req, res) => {
    try {
        const { role, permissions } = req.body;
        const roleExists = await Role.findById(role);
        if (!roleExists) {
            return res.status(400).json({ error: 'Role not found' });
        }
        for (let permission of permissions) {
            const moduleExists = await Module.findById(permission.module_id);
            if (!moduleExists) {
                return res.status(400).json({ error: `Module with id ${permission.module_id} not found` });
            }

            for (let func of permission.functionalities) {
                const funcExists = await Functionality.findOne({ functionality_name: func.functionality_name, module: permission.module_id });
                if (!funcExists) {
                    return res.status(400).json({ error: `Functionality ${func.functionality_name} not found for module ${permission.module_id}` });
                }
            }
        }
        let roleWithPermissions = await Permission.findOne({ role });

        if (!roleWithPermissions) {
            roleWithPermissions = new Permission({ role, permissions });
        } else {
            const isSameData = permissions.every(permission => {
                const existingModule =  roleWithPermissions.permissions.find(perm => perm.module_id.equals(permission.module_id));

                if (!existingModule) return false;

                return permission.functionalities.every(func => {
                    const existingFunc = existingModule.functionalities.find(f => f.functionality_name === func.functionality_name);
                    return existingFunc && existingFunc.allowed === func.allowed;
                });
            });

            if (isSameData) {
                return res.status(400).json({ error: 'This data already exists' });
            }
            permissions.forEach(permission => {
                const moduleIndex = roleWithPermissions.permissions.findIndex(perm => perm.module_id.equals(permission.module_id));

                if (moduleIndex !== -1) {
                    const existingModule = roleWithPermissions.permissions[moduleIndex];
                    permission.functionalities.forEach(func => {
                        const funcIndex = existingModule.functionalities.findIndex(f => f.functionality_name === func.functionality_name);

                        if (funcIndex !== -1) {
                            existingModule.functionalities[funcIndex].allowed = func.allowed;
                        } else {
                            existingModule.functionalities.push(func);
                        }
                    });
                } else {
                    roleWithPermissions.permissions.push(permission);
                }
            });
        }
        await roleWithPermissions.save();
        res.status(201).json(roleWithPermissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updatePermission = async (req, res) => {
    try {
        const { roleId } = req.body;
        const { permissions } = req.body;
        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(400).json({ error: 'Role not found' });
        }
        for (let permission of permissions) {
            const moduleExists = await Module.findById(permission.module_id);
            if (!moduleExists) {
                return res.status(400).json({ error: `Module with id ${permission.module_id} not found` });
            }

            for (let func of permission.functionalities) {
                const funcExists = await Functionality.findOne({ functionality_name: func.functionality_name, module: permission.module_id });
                if (!funcExists) {
                    return res.status(400).json({ error: `Functionality ${func.functionality_name} not found for module ${permission.module_id}` });
                }
            }
        }

        let roleWithPermissions = await Permission.findOne({ role: roleId });

        if (!roleWithPermissions) {
            return res.status(404).json({ error: 'Permissions for this role not found' });
        }
        permissions.forEach(permission => {
            const moduleIndex = roleWithPermissions.permissions.findIndex(perm => perm.module_id.equals(permission.module_id));

            if (moduleIndex !== -1) {
                const existingModule = roleWithPermissions.permissions[moduleIndex];
                permission.functionalities.forEach(func => {
                    const funcIndex = existingModule.functionalities.findIndex(f => f.functionality_name === func.functionality_name);

                    if (funcIndex !== -1) {
                        existingModule.functionalities[funcIndex].allowed = func.allowed;
                    } else {
                        existingModule.functionalities.push(func);
                    }
                });
            } else {
                roleWithPermissions.permissions.push(permission);
            }
        });

        await roleWithPermissions.save();
        res.status(200).json(roleWithPermissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deletePermission = async (req, res) => {
    try {
        const { roleId, permissions } = req.body;
        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(400).json({ error: 'Role not found' });
        }
        for (let permission of permissions) {
            const moduleExists = await Module.findById(permission.module_id);
            if (!moduleExists) {
                return res.status(400).json({ error: `Module with id ${permission.module_id} not found` });
            }

            for (let func of permission.functionalities) {
                const funcExists = await Functionality.findOne({ functionality_name: func.functionality_name, module: permission.module_id });
                if (!funcExists) {
                    return res.status(400).json({ error: `Functionality ${func.functionality_name} not found for module ${permission.module_id}` });
                }
            }
        }

        let roleWithPermissions = await Permission.findOne({ role: roleId });

        if (!roleWithPermissions) {
            return res.status(404).json({ error: 'Permissions for this role not found' });
        }

        permissions.forEach(permission => {
            const moduleIndex = roleWithPermissions.permissions.findIndex(perm => perm.module_id.equals(permission.module_id));

            if (moduleIndex !== -1) {
                const existingModule = roleWithPermissions.permissions[moduleIndex];
                permission.functionalities.forEach(func => {
                    const funcIndex = existingModule.functionalities.findIndex(f => f.functionality_name === func.functionality_name);

                    if (funcIndex !== -1) {
                        existingModule.functionalities.splice(funcIndex, 1);
                    }
                });

                if (existingModule.functionalities.length === 0) {
                    roleWithPermissions.permissions.splice(moduleIndex, 1);
                }
            }
        });

        await roleWithPermissions.save();
        res.status(200).json(roleWithPermissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const updateAllPermissions = async (req, res) => {
    try {
        const { roleId } = req.params;
        const { permissions } = req.body;
        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(400).json({ error: 'Role not found' });
        }

        let roleWithPermissions = await Permission.findOne({ role: roleId });

        if (!roleWithPermissions) {
            roleWithPermissions = new Permission({ role: roleId, permissions: [] });
        }

        for (let permission of permissions) {
            const moduleExists = await Module.findById(permission.module_id);
            if (!moduleExists) {
                return res.status(400).json({ error: `Module with id ${permission.module_id} not found` });
            }

            for (let func of permission.functionalities) {
                const funcExists = await Functionality.findOne({ functionality_name: func.functionality_name, module: permission.module_id });
                if (!funcExists) {
                    return res.status(400).json({ error: `Functionality ${func.functionality_name} not found for module ${permission.module_id}` });
                }
            }
            const moduleIndex = roleWithPermissions.permissions.findIndex(perm => perm.module_id.equals(permission.module_id));
            if (moduleIndex !== -1) {
                const existingModule = roleWithPermissions.permissions[moduleIndex];
                existingModule.allowed = permission.allowed;
                for (let func of permission.functionalities) {
                    const funcIndex = existingModule.functionalities.findIndex(f => f.functionality_name === func.functionality_name);
                    if (funcIndex !== -1) {
                        existingModule.functionalities[funcIndex].allowed = func.allowed;
                    } else {
                        existingModule.functionalities.push(func);
                    }
                }
            } else {
                roleWithPermissions.permissions.push(permission);
            }
        }

        await roleWithPermissions.save();
        res.status(200).json(roleWithPermissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const deleteAllPermissions = async (req, res) => {
    try {
        const { permissionId } = req.params;
        const deletepermissions = await Role.findById(permissionId);
        if (!deletepermissions) {
            return res.status(400).json({ error: 'permission id not found' });
        }
        const deletedPermissions = await Permission.findOneAndDelete({ permissionId: permissionId });

        if (!deletedPermissions) {
            return res.status(404).json({ error: 'Permissions for this role not found' });
        }

        res.status(200).json({ message: 'All permissions deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const getModuleIdWithFunctionalities = async (req, res) => {
    try {
        const { moduleId } = req.params;
        const moduleExists = await Module.findById(moduleId);
        if (!moduleExists) {
            return res.status(400).json({ error: 'Module not found' });
        }
        const moduleFunctionalities = await Functionality.find({ module: moduleId });

        if (!moduleFunctionalities || moduleFunctionalities.length === 0) {
            return res.status(404).json({ error: 'Functionalities for this module not found' });
        }

        res.status(200).json(moduleFunctionalities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
const getRoleIdWithModulesAndFunctionalities = async (req, res) => {
    try {
        const { roleId } = req.params;

        const roleExists = await Role.findById(roleId);
        if (!roleExists) {
            return res.status(400).json({ error: 'Role not found' });
        }
        const pipeline = [
            {
                $match: { role: new mongoose.Types.ObjectId(roleId) }
            },
            {
                $lookup: {
                    from: 'modules',
                    localField: 'permissions.module_id',
                    foreignField: '_id',
                    as: 'modules'
                }
            },
        ];

        const permissions = await Permission.aggregate(pipeline);

        if (!permissions || permissions.length === 0) {
            return res.status(404).json({ error: 'Permissions for this role not found' });
        }

        res.status(200).json(permissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};
module.exports={
    addPermission,
    updatePermission,
    deletePermission,
    updateAllPermissions,
    deleteAllPermissions,
    getModuleIdWithFunctionalities,
    getRoleIdWithModulesAndFunctionalities
}