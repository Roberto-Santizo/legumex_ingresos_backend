"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeBenefitedStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const DeliveryEquipmentTransaction_model_1 = __importDefault(require("./DeliveryEquipmentTransaction.model"));
var EmployeeBenefitedStatus;
(function (EmployeeBenefitedStatus) {
    EmployeeBenefitedStatus["DELIVER_EQUIPMENT"] = "DELIVER_EQUIPMENT";
    EmployeeBenefitedStatus["FINAL_PHOTO"] = "FINAL_PHOTO";
    EmployeeBenefitedStatus["COMPLETED"] = "COMPLETED";
})(EmployeeBenefitedStatus || (exports.EmployeeBenefitedStatus = EmployeeBenefitedStatus = {}));
let EmployeeBenefited = class EmployeeBenefited extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER }),
    __metadata("design:type", Number)
], EmployeeBenefited.prototype, "employee_benefited_id", void 0);
__decorate([
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100), allowNull: false }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "external_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150) }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "employee_name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(50) }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "employee_code", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(100) }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "employee_position", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(150) }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "department_name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING(500), allowNull: true }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "photo_url", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(EmployeeBenefitedStatus.DELIVER_EQUIPMENT),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM(...Object.values(EmployeeBenefitedStatus)), allowNull: false }),
    __metadata("design:type", String)
], EmployeeBenefited.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => DeliveryEquipmentTransaction_model_1.default, 'employee_benefited_id'),
    __metadata("design:type", Array)
], EmployeeBenefited.prototype, "transactions", void 0);
EmployeeBenefited = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'employee_benefited' })
], EmployeeBenefited);
exports.default = EmployeeBenefited;
//# sourceMappingURL=EmployeeBenefited.model.js.map