import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import VisitStatus from "../models/Visit_status.model";
import Company from "./Company.model";
import CompanyPerson from "./CompanyPerson.model";
import Department from "./Department.model";
import Agent from "./Agent.model";
import VisitCompanion from "./VisitCompanion.model";
import User from "./User.model";

@Table({
    tableName: 'visit',
        indexes: [
        { fields: ['visitor_person_id'] },
        { fields: ['visit_status_id'] },
        { fields: ['visitor_person_id', 'visit_status_id'] },
        { fields: ['date'] },
        { fields: ['date', 'visit_status_id'] },
    ]
})

export default class Visit extends Model {

    @Column({
        type: DataType.DATE,
    })
    declare date: Date

    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    declare entry_time: string

    @ForeignKey(() => VisitStatus)
    @Column({
        type: DataType.INTEGER,
    })
    declare visit_status_id: number

    @BelongsTo(() => VisitStatus)
    visit_status: VisitStatus

    // Empresa/proveedor que programa la visita (obligatorio desde fase 1)
    @ForeignKey(() => Company)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'visitor_id',
    })
    declare company_id: number

    @BelongsTo(() => Company)
    company: Company

    // Persona específica que realmente llegó (el agente lo confirma en check-in)
    @ForeignKey(() => CompanyPerson)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        field: 'visitor_person_id',
    })
    declare company_person_id: number

    @BelongsTo(() => CompanyPerson)
    company_person: CompanyPerson

    @ForeignKey(() => Department)
    @Column({
        type: DataType.INTEGER,
    })
    declare department_id: number

    @BelongsTo(() => Department)
    department: Department

    @Column({
        type: DataType.STRING(100),
    })
    declare destination: string

    @Column({
        type: DataType.STRING(100),
    })
    declare responsible_person: string

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare badge_number: string

    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    declare license_plate: string | null

    @Column({
        type: DataType.TIME,
        allowNull: true,
    })
    declare exit_time: string

    @HasMany(() => VisitCompanion)
    visit_companions: VisitCompanion[]

    @ForeignKey(() => Agent)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare agent_id: number

    @BelongsTo(() => Agent)
    agent: Agent

    @ForeignKey(() => User)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare created_by: number

    @BelongsTo(() => User, 'created_by')
    created_by_user: User
}
