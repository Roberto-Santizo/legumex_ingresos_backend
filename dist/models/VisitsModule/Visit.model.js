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
const Visit_status_model_1 = __importDefault(require("./Visit_status.model"));
const Company_model_1 = __importDefault(require("./Company.model"));
const CompanyPerson_model_1 = __importDefault(require("./CompanyPerson.model"));
const Department_model_1 = __importDefault(require("./Department.model"));
const Agent_model_1 = __importDefault(require("./Agent.model"));
const VisitCompanion_model_1 = __importDefault(require("./VisitCompanion.model"));
const User_model_1 = __importDefault(require("../AccessControl/User.model"));
let Visit = class Visit extends sequelize_typescript_1.Model {
    visit_status;
    company;
    company_person;
    department;
    visit_companions;
    agent;
    created_by_user;
};
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
    }),
    __metadata("design:type", Date)
], Visit.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Visit.prototype, "entry_time", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Visit_status_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    __metadata("design:type", Number)
], Visit.prototype, "visit_status_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Visit_status_model_1.default),
    __metadata("design:type", Visit_status_model_1.default
    // Empresa/proveedor que programa la visita (obligatorio desde fase 1)
    )
], Visit.prototype, "visit_status", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Company_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: false,
        field: 'visitor_id',
    }),
    __metadata("design:type", Number)
], Visit.prototype, "company_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Company_model_1.default),
    __metadata("design:type", Company_model_1.default
    // Persona específica que realmente llegó (el agente lo confirma en check-in)
    )
], Visit.prototype, "company", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => CompanyPerson_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
        field: 'visitor_person_id',
    }),
    __metadata("design:type", Number)
], Visit.prototype, "company_person_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => CompanyPerson_model_1.default),
    __metadata("design:type", CompanyPerson_model_1.default)
], Visit.prototype, "company_person", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Department_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
    }),
    __metadata("design:type", Number)
], Visit.prototype, "department_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Department_model_1.default),
    __metadata("design:type", Department_model_1.default)
], Visit.prototype, "department", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
    }),
    __metadata("design:type", String)
], Visit.prototype, "destination", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
    }),
    __metadata("design:type", String)
], Visit.prototype, "responsible_person", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(100),
        allowNull: true,
    }),
    __metadata("design:type", String)
], Visit.prototype, "badge_number", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(20),
        allowNull: true,
    }),
    __metadata("design:type", String)
], Visit.prototype, "license_plate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TIME,
        allowNull: true,
    }),
    __metadata("design:type", String)
], Visit.prototype, "exit_time", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => VisitCompanion_model_1.default),
    __metadata("design:type", Array)
], Visit.prototype, "visit_companions", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Agent_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Visit.prototype, "agent_id", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Agent_model_1.default),
    __metadata("design:type", Agent_model_1.default)
], Visit.prototype, "agent", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_model_1.default),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.INTEGER,
        allowNull: true,
    }),
    __metadata("design:type", Number)
], Visit.prototype, "created_by", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_model_1.default, 'created_by'),
    __metadata("design:type", User_model_1.default)
], Visit.prototype, "created_by_user", void 0);
Visit = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'visit',
        indexes: [
            { fields: ['visitor_person_id'] },
            { fields: ['visit_status_id'] },
            { fields: ['visitor_person_id', 'visit_status_id'] },
            { fields: ['date'] },
            { fields: ['date', 'visit_status_id'] },
        ]
    })
], Visit);
exports.default = Visit;
//# sourceMappingURL=Visit.model.js.map