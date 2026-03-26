import { Table, Column, DataType, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import Visit from "./Visit.model";
import CompanyPerson from "./CompanyPerson.model";
import Companion from "./Companion.model";

@Table({
    tableName: 'visit_companions'
})

export default class VisitCompanion extends Model {

    @ForeignKey(() => Visit)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare visit_id: number

    @BelongsTo(() => Visit)
    visit: Visit

    @ForeignKey(() => CompanyPerson)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'visitor_person_id',
    })
    declare company_person_id: number

    @BelongsTo(() => CompanyPerson)
    company_person: CompanyPerson

    // Columna legada — se mantiene nullable para compatibilidad con la BD existente
    @ForeignKey(() => Companion)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare companion_id: number | null

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare badge_number: string
}
