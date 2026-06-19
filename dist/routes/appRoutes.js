"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// AccessControl
const auth_routes_1 = __importDefault(require("./AccessControl/auth.routes"));
const user_routes_1 = __importDefault(require("./AccessControl/user.routes"));
const role_routes_1 = __importDefault(require("./AccessControl/role.routes"));
const permission_routes_1 = __importDefault(require("./AccessControl/permission.routes"));
// VisitsModule
const visit_routes_1 = __importDefault(require("./VisitsModule/visit.routes"));
const visitReports_routes_1 = __importDefault(require("./VisitsModule/visitReports.routes"));
const visitCompanion_routes_1 = __importDefault(require("./VisitsModule/visitCompanion.routes"));
const company_routes_1 = __importDefault(require("./VisitsModule/company.routes"));
const companyPerson_routes_1 = __importDefault(require("./VisitsModule/companyPerson.routes"));
const department_routes_1 = __importDefault(require("./VisitsModule/department.routes"));
const agent_routes_1 = __importDefault(require("./VisitsModule/agent.routes"));
const people_routes_1 = __importDefault(require("./VisitsModule/people.routes"));
// EquipmentDeliveryModule
const equipment_routes_1 = __importDefault(require("./EquipmentDeliveryModule/equipment.routes"));
const EmployeeBenefited_routes_1 = __importDefault(require("./EquipmentDeliveryModule/EmployeeBenefited.routes"));
const DeliveryEquipmentTransaction_routes_1 = __importDefault(require("./EquipmentDeliveryModule/DeliveryEquipmentTransaction.routes"));
const equipmentReports_routes_1 = __importDefault(require("./EquipmentDeliveryModule/equipmentReports.routes"));
const appRouter = (0, express_1.Router)();
appRouter.use("/login", auth_routes_1.default);
appRouter.use("/user", user_routes_1.default);
appRouter.use("/role", role_routes_1.default);
appRouter.use("/permissions", permission_routes_1.default);
appRouter.use("/visit", visit_routes_1.default);
appRouter.use("/reports", visitReports_routes_1.default);
appRouter.use("/visit-companion", visitCompanion_routes_1.default);
appRouter.use("/company", company_routes_1.default);
appRouter.use("/company-person", companyPerson_routes_1.default);
appRouter.use("/department", department_routes_1.default);
appRouter.use("/agent", agent_routes_1.default);
appRouter.use("/people", people_routes_1.default);
appRouter.use("/equipment", equipment_routes_1.default);
appRouter.use("/employee-benefited", EmployeeBenefited_routes_1.default);
appRouter.use("/delivery-equipment-transaction", DeliveryEquipmentTransaction_routes_1.default);
appRouter.use("/equipment-reports", equipmentReports_routes_1.default);
exports.default = appRouter;
//# sourceMappingURL=appRoutes.js.map