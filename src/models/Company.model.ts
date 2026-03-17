import { Table, Column, DataType, Model, HasMany } from "sequelize-typescript";
import People from "./People.model";

@Table({
    tableName: 'company'
})

export default class Company extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true,
    })
    declare name: string

    @HasMany(() => People)
    people: People[]
}
