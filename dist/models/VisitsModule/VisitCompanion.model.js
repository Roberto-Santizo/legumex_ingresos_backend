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
const Visit_model_1 = __importDefault(require("./Visit.model"));
const CompanyPerson_model_1 = __importDefault(require("./CompanyPerson.model"));
let VisitCompanion = class VisitCompanion extends sequelize_typescript_1.Model {
    visit;
    company_person;
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Visit_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
    }),
    __metadata("design:type", Number)
], VisitCompanion.prototype, "visit_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Visit_model_1.default),
    __metadata("design:type", Visit_model_1.default)
], VisitCompanion.prototype, "visit", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CompanyPerson_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'visitor_person_id',
    }),
    __metadata("design:type", Number)
], VisitCompanion.prototype, "company_person_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CompanyPerson_model_1.default),
    __metadata("design:type", CompanyPerson_model_1.default)
], VisitCompanion.prototype, "company_person", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
    }),
    __metadata("design:type", String)
], VisitCompanion.prototype, "badge_number", void 0);
VisitCompanion = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'visit_companions'
    })
], VisitCompanion);
exports.default = VisitCompanion;
//# sourceMappingURL=VisitCompanion.model.js.map