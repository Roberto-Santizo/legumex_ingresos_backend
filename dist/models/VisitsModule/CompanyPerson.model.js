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
const Company_model_1 = __importDefault(require("./Company.model"));
const VisitCompanion_model_1 = __importDefault(require("./VisitCompanion.model"));
let CompanyPerson = class CompanyPerson extends sequelize_typescript_1.Model {
    company;
    visit_companions;
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'visitor_id',
    }),
    __metadata("design:type", Number)
], CompanyPerson.prototype, "company_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_model_1.default),
    __metadata("design:type", Company_model_1.default)
], CompanyPerson.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: false,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(50),
        allowNull: false,
        unique: true,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "document_number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "document_photo_front", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "document_photo_back", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "license_number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: true,
    }),
    __metadata("design:type", String)
], CompanyPerson.prototype, "license_photo", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => VisitCompanion_model_1.default),
    __metadata("design:type", Array)
], CompanyPerson.prototype, "visit_companions", void 0);
CompanyPerson = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'company_person'
    })
], CompanyPerson);
exports.default = CompanyPerson;
//# sourceMappingURL=CompanyPerson.model.js.map