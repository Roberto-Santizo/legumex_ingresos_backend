"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeeders = runSeeders;
const bcrypt_1 = __importDefault(require("bcrypt"));
const VisitsModule_1 = require("../models/VisitsModule");
const AccessControl_1 = require("../models/AccessControl");
const PERMISSIONS = [
    { name: 'users:view', description: 'Ver usuarios' },
    { name: 'users:create', description: 'Crear usuarios' },
    { name: 'users:edit', description: 'Editar usuarios' },
    { name: 'roles:view', description: 'Ver roles' },
    { name: 'roles:create', description: 'Crear roles' },
    { name: 'roles:edit', description: 'Editar roles' },
    { name: 'agents:view', description: 'Ver agentes' },
    { name: 'agents:create', description: 'Crear agentes' },
    { name: 'agents:edit', description: 'Editar agentes' },
    { name: 'companies:view', description: 'Ver empresas' },
    { name: 'companies:create', description: 'Crear empresas' },
    { name: 'companies:edit', description: 'Editar empresas' },
    { name: 'people:view', description: 'Ver personas de empresa' },
    { name: 'people:create', description: 'Crear personas de empresa' },
    { name: 'people:edit', description: 'Editar personas de empresa' },
    { name: 'departments:view', description: 'Ver departamentos' },
    { name: 'departments:create', description: 'Crear departamentos' },
    { name: 'departments:edit', description: 'Editar departamentos' },
    { name: 'visits:view', description: 'Ver visitas propias' },
    { name: 'visits:view:all', description: 'Ver todas las visitas' },
    { name: 'visits:create', description: 'Crear visitas' },
    { name: 'visits:checkin', description: 'Registrar entrada de visitas' },
    { name: 'visits:checkout', description: 'Registrar salida de visitas' },
    { name: 'visits:cancel', description: 'Cancelar visitas' },
    { name: 'visits:edit', description: 'Editar visitas programadas' },
    { name: 'visits:delete', description: 'Eliminar visitas programadas' },
    { name: 'visitsReports:view', description: 'Ver reportes de visitas' },
    { name: 'equipmentReports:view', description: 'Ver reportes de equipo' },
    { name: 'equipment:create', description: 'Crear equipo de trabajo' },
    { name: 'equipment:view', description: 'Ver equipo de trabajo' },
    { name: 'equipment:updateEquipment', description: 'Editar equipo' },
    { name: 'users:delete', description: 'Eliminar usuarios' },
    { name: 'roles:delete', description: 'Eliminar roles' },
    { name: 'agents:delete', description: 'Eliminar agentes' },
    { name: 'companies:delete', description: 'Eliminar empresas' },
    { name: 'people:delete', description: 'Eliminar personas de empresa' },
    { name: 'departments:delete', description: 'Eliminar departamentos' },
    { name: 'employeeBenefited:view', description: 'Ver empleados beneficiados' },
    { name: 'employeeBenefited:edit', description: 'Registrar empleado beneficiado' },
    { name: 'employeeBenefited:delete', description: 'Eliminar empleado beneficiado' },
    { name: 'deliveryTransaction:create', description: 'Asignar equipo a empleado' },
    { name: 'deliveryTransaction:finalPhoto', description: 'Subir foto final de entrega' },
    { name: 'deliveryTransaction:view', description: 'Ver historial de entregas de equipo' },
];
async function seedAdmin() {
    const [department] = await VisitsModule_1.Department.findOrCreate({
        where: { code: 'ADMIN' },
        defaults: { name: 'Administración', code: 'ADMIN' }
    });
    const [adminRole] = await AccessControl_1.Role.findOrCreate({
        where: { name: 'Administrador' },
        defaults: { name: 'Administrador' }
    });
    const allPermissions = await AccessControl_1.Permission.findAll();
    const existingRolePermissions = await AccessControl_1.RolePermission.findAll({ where: { role_id: adminRole.id } });
    const existingPermIds = new Set(existingRolePermissions.map(rolePermission => rolePermission.permission_id));
    const missing = allPermissions.filter(permission => !existingPermIds.has(permission.id));
    if (missing.length > 0) {
        await AccessControl_1.RolePermission.bulkCreate(missing.map(permission => ({ role_id: adminRole.id, permission_id: permission.id })));
    }
    const adminUsername = process.env.SEED_ADMIN_USERNAME;
    const adminPassword = process.env.SEED_ADMIN_PASSWORD;
    if (!adminUsername || !adminPassword)
        throw new Error('SEED_ADMIN_USERNAME and SEED_ADMIN_PASSWORD ARE REQUIRED in .env');
    const existingUser = await AccessControl_1.User.findOne({ where: { username: adminUsername } });
    if (!existingUser) {
        const hashedPassword = await bcrypt_1.default.hash(adminPassword, 10);
        await AccessControl_1.User.create({
            name: adminUsername,
            username: adminUsername,
            password: hashedPassword,
            role_id: adminRole.id,
            department_id: department.id
        });
    }
}
// Migra el permiso legado 'reports:view' (compartido por visitas y equipo) a 'visitsReports:view',
// preservando su id (y por lo tanto los roles que ya lo tenían asignado).
// Devuelve los role_id que deben recibir también 'equipmentReports:view' para no perder acceso al dashboard de equipo.
async function migrateLegacyReportsPermission() {
    const legacyPermission = await AccessControl_1.Permission.findOne({ where: { name: 'reports:view' } });
    if (!legacyPermission)
        return [];
    const linkedRolePermissions = await AccessControl_1.RolePermission.findAll({ where: { permission_id: legacyPermission.id } });
    const linkedRoleIds = linkedRolePermissions.map(rolePermission => rolePermission.role_id);
    // 'visitsReports:view' puede ya existir como fila independiente (creada por un bulkCreate previo
    // antes de que esta migracion existiera). En ese caso, reasignar los roles y eliminar la fila legada
    // en vez de renombrar, para no violar la restriccion UNIQUE de 'name'.
    const existingVisitsReportsPermission = await AccessControl_1.Permission.findOne({ where: { name: 'visitsReports:view' } });
    if (existingVisitsReportsPermission) {
        if (linkedRoleIds.length > 0) {
            await AccessControl_1.RolePermission.bulkCreate(linkedRoleIds.map(roleId => ({ role_id: roleId, permission_id: existingVisitsReportsPermission.id })), { ignoreDuplicates: true });
        }
        await AccessControl_1.RolePermission.destroy({ where: { permission_id: legacyPermission.id } });
        await legacyPermission.destroy();
    }
    else {
        await legacyPermission.update({ name: 'visitsReports:view' });
    }
    return linkedRoleIds;
}
async function runSeeders() {
    await VisitsModule_1.VisitStatus.bulkCreate([
        { name: 'PROGRAMADA' },
        { name: 'EN PLANTA' },
        { name: 'FINALIZADA' },
        { name: 'CANCELADA' },
    ], { ignoreDuplicates: true });
    const roleIdsNeedingEquipmentReports = await migrateLegacyReportsPermission();
    await AccessControl_1.Permission.bulkCreate(PERMISSIONS, { ignoreDuplicates: true });
    if (roleIdsNeedingEquipmentReports.length > 0) {
        const equipmentReportsPermission = await AccessControl_1.Permission.findOne({ where: { name: 'equipmentReports:view' } });
        if (equipmentReportsPermission) {
            await AccessControl_1.RolePermission.bulkCreate(roleIdsNeedingEquipmentReports.map(roleId => ({ role_id: roleId, permission_id: equipmentReportsPermission.id })), { ignoreDuplicates: true });
        }
    }
    await seedAdmin();
}
//# sourceMappingURL=seeder.js.map