import { Router } from 'express';
import { validateJWT, checkPermission } from '../../middleware/jwt';
import { body, param } from 'express-validator';
import { handleInputErrors } from '../../middleware/index';
import { createDeliveryEquipmentTransaction, uploadFinalPhoto, getDeliveryTransactionsByEmployee } from '../../handlers/EquipmentDeliveryModule/DeliveryEquipmentTransaction';

const router = Router();

console.log('[DeliveryTransaction] Router loaded');

router.use((req, _res, next) => {
    console.log(`[DeliveryTransaction] ${req.method} ${req.path}`);
    next();
});

router.post('/',
    validateJWT,
    checkPermission('deliveryTransaction:create'),
    body('employee_benefited_id').isInt({ min: 1 }).withMessage('ID de empleado invalido'),
    body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un equipo'),
    body('items.*.equipment_id').isInt({ min: 1 }).withMessage('ID de equipo invalido'),
    body('items.*.equipment_condition').isIn(['NEW', 'USED']).withMessage('Condicion invalida'),
    body('items.*.delivery_equipment_type').isIn(['DELIVERED', 'CHANGE']).withMessage('Tipo de entrega invalido'),
    body('items.*.is_paid').isBoolean().withMessage('El campo pagado debe ser verdadero o falso'),
    handleInputErrors,
    createDeliveryEquipmentTransaction
);

router.patch('/final-photo/:employeeBenefitedId',
    validateJWT,
    checkPermission('deliveryTransaction:finalPhoto'),
    param('employeeBenefitedId').isInt({ min: 1 }).withMessage('ID de empleado invalido'),
    body('photo_base64').notEmpty().withMessage('La foto es requerida'),
    handleInputErrors,
    uploadFinalPhoto
);

router.get('/by-employee/:employeeBenefitedId',
    validateJWT,
    checkPermission('deliveryTransaction:view'),
    param('employeeBenefitedId').isInt({ min: 1 }).withMessage('ID de empleado invalido'),
    handleInputErrors,
    getDeliveryTransactionsByEmployee
);

export default router;
