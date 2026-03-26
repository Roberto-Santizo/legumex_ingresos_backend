import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import Company from "./Company.model";
import VisitCompanion from "./VisitCompanion.model";

@Table({
    tableName: 'company_person'
})

export default class CompanyPerson extends Model {

    @ForeignKey(() => Company)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'visitor_id',
    })
    declare company_id: number

    @BelongsTo(() => Company)
    company: Company

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
    })
    declare document_number: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare document_photo_front: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare document_photo_back: string

    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    declare license_number: string

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare license_photo: string

    @HasMany(() => VisitCompanion)
    visit_companions: VisitCompanion[]
}
