import { Table, Column, DataType, Model, ForeignKey, BelongsTo, HasMany } from "sequelize-typescript";
import Visitor from "./Visitor.model";
import VisitCompanion from "./VisitCompanion.model";

@Table({
    tableName: 'visitor_person'
})

export default class VisitorPerson extends Model {

    @ForeignKey(() => Visitor)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare visitor_id: number

    @BelongsTo(() => Visitor)
    visitor: Visitor

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
    declare document_photo: string

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
