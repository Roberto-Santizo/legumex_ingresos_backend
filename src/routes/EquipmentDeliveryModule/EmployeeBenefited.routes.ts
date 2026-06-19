import { Router } from 'express';
import { param } from 'express-validator';
import { handleInputErrors } from '../../middleware';
import { validateJWT, checkPermission } from '../../middleware/jwt';
import {searchExternalEmployees, findOrCreateEmployeeBenefited, getEmployeeBenefiteds, deleteEmployeeBenefited } from '../../handlers/EquipmentDeliveryModule/EmployeeBenefited';


const router = Router();

router.get('/search',
    validateJWT,
    checkPermission('employeeBenefited:view'),
    searchExternalEmployees
);

router.post('/find-or-create',
    validateJWT,
    checkPermission('employeeBenefited:edit'),
    findOrCreateEmployeeBenefited
);

router.get('/',
    validateJWT,
    checkPermission('employeeBenefited:view'),
    getEmployeeBenefiteds
);

router.delete('/:id',
    validateJWT,
    checkPermission('employeeBenefited:delete'),
    param('id').isInt().withMessage('Id no válido'),
    handleInputErrors,
    deleteEmployeeBenefited
);

export default router;
