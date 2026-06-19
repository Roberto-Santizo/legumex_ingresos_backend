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
const sequelize_typescript_1 = require("sequelize-typescript");
const User_model_1 = __importDefault(require("../AccessControl/User.model"));
const EmployeeBenefited_model_1 = __importDefault(require("./EmployeeBenefited.model"));
const EquipmentDeliveryDetails_1 = __importDefault(require("./EquipmentDeliveryDetails"));
let DeliveryEquipmentTransaction = class DeliveryEquipmentTransaction extends sequelize_typescript_1.Model {
};
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.INTEGER
    }),
    __metadata("design:type", Number)
], DeliveryEquipmentTransaction.prototype, "delivery_equipment_transaction_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => EmployeeBenefited_model_1.default),
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    __metadata("design:type", Number)
], DeliveryEquipmentTransaction.prototype, "employee_benefited_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_model_1.default),
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.INTEGER
    }),
    __metadata("design:type", Number)
], DeliveryEquipmentTransaction.prototype, "delivered_by_user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => EquipmentDeliveryDetails_1.default),
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.INTEGER
    }),
    __metadata("design:type", Number)
], DeliveryEquipmentTransaction.prototype, "equipment_delivery_detail_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.DATE
    }),
    __metadata("design:type", Date)
], DeliveryEquipmentTransaction.prototype, "delivery_date", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(1),
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.INTEGER
    }),
    __metadata("design:type", Number)
], DeliveryEquipmentTransaction.prototype, "delivery_batch_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        allowNull: false,
        type: sequelize_typescript_1.DataType.ENUM('DELIVERED', 'CHANGE')
    }),
    __metadata("design:type", String)
], DeliveryEquipmentTransaction.prototype, "delivery_equipment_type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.BOOLEAN
    }),
    __metadata("design:type", Boolean)
], DeliveryEquipmentTransaction.prototype, "is_paid", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        allowNull: true,
        type: sequelize_typescript_1.DataType.TEXT
    }),
    __metadata("design:type", String)
], DeliveryEquipmentTransaction.prototype, "delivery_photo_url", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        allowNull: true,
        type: sequelize_typescript_1.DataType.TEXT
    }),
    __metadata("design:type", String)
], DeliveryEquipmentTransaction.prototype, "delivery_notes", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => EmployeeBenefited_model_1.default),
    __metadata("design:type", EmployeeBenefited_model_1.default)
], DeliveryEquipmentTransaction.prototype, "employeeBenefited", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_model_1.default),
    __metadata("design:type", User_model_1.default)
], DeliveryEquipmentTransaction.prototype, "deliveredBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => EquipmentDeliveryDetails_1.default),
    __metadata("design:type", EquipmentDeliveryDetails_1.default)
], DeliveryEquipmentTransaction.prototype, "equipmentDetails", void 0);
DeliveryEquipmentTransaction = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'delivery_equipment_transaction'
    })
], DeliveryEquipmentTransaction);
exports.default = DeliveryEquipmentTransaction;
//# sourceMappingURL=DeliveryEquipmentTransaction.model.js.map