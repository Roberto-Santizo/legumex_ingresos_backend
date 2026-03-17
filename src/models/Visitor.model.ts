import { Table, Column, DataType, Model, HasMany } from "sequelize-typescript";
import VisitorPerson from "./VisitorPerson.model";

@Table({
    tableName: 'visitor'
})

export default class Visitor extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true,
    })
    declare name: string

    @HasMany(() => VisitorPerson)
    visitor_persons: VisitorPerson[]
}
