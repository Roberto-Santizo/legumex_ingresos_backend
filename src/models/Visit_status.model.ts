import { Table, Model, DataType, Column } from "sequelize-typescript";

@Table({
    tableName: 'visit_status'
})

export default class VisitStatus extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
        unique: true,
    })
    declare name: string
}