"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv_1 = __importDefault(require("dotenv"));
const AccessControl_1 = require("../models/AccessControl");
const VisitsModule_1 = require("../models/VisitsModule");
//Importing Equipment Delivery Module Models
const Equipment_model_1 = __importDefault(require("../models/EquipmentDeliveryModule/Equipment.model"));
const EmployeeBenefited_model_1 = __importDefault(require("../models/EquipmentDeliveryModule/EmployeeBenefited.model"));
const EquipmentDeliveryDetails_1 = __importDefault(require("../models/EquipmentDeliveryModule/EquipmentDeliveryDetails"));
const DeliveryEquipmentTransaction_model_1 = __importDefault(require("../models/EquipmentDeliveryModule/DeliveryEquipmentTransaction.model"));
dotenv_1.default.config();
const db = new sequelize_typescript_1.Sequelize(process.env.DATABASE_URL, {
    models: [AccessControl_1.Role, AccessControl_1.User, VisitsModule_1.Department, VisitsModule_1.People, VisitsModule_1.Agent, VisitsModule_1.VisitStatus, VisitsModule_1.Visit, VisitsModule_1.VisitCompanion, VisitsModule_1.Company, VisitsModule_1.CompanyPerson, AccessControl_1.Permission,
        AccessControl_1.RolePermission, Equipment_model_1.default, EquipmentDeliveryDetails_1.default, DeliveryEquipmentTransaction_model_1.default, EmployeeBenefited_model_1.default],
    logging: false,
    pool: {
        max: 5,
        min: 1,
        acquire: 30000,
        idle: 10000,
    },
});
exports.default = db;
//# sourceMappingURL=db.js.map