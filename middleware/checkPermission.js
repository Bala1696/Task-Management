const Permission = require('../model/permissionModel');

const checkPermission = (requiredModule, requiredFunctionality) => {
    return async (req, res, next) => {
        try {
            const roleId = req.user.role;
            const roleWithPermissions = await Permission.findOne({ role: roleId });

            if (!roleWithPermissions) {
                return res.status(403).json({ error: 'Forbidden: No permissions found for this role' });
            }

            const modulePermission = roleWithPermissions.permissions.find(permission => permission.module_name === requiredModule);

            if (!modulePermission || !modulePermission.allowed) {
                return res.status(403).json({ error: `Forbidden: No access to the module ${requiredModule}` });
            }

            const functionalityPermission = modulePermission.functionalities.find(func => func.functionality_name === requiredFunctionality);

            if (!functionalityPermission || !functionalityPermission.allowed) {
                return res.status(403).json({ error: `Forbidden: No access to the functionality ${requiredFunctionality}` });
            }

            next();
        } catch (error) {
            console.error('Permission check error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
module.exports = checkPermission;
