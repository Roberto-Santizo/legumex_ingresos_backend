import { Router } from 'express';
import { validateJWT, checkPermission } from '../../middleware/jwt';
import {searchExternalEmployees, findOrCreateEmployeeBenefited, getEmployeeBenefiteds } from '../../handlers/EquipmentDeliveryModule/EmployeeBenefited';


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

export default router;
