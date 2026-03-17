import { Table, Column, DataType, Model, HasMany } from "sequelize-typescript";
import User from "./User.model";
import Visit from "./Visit.model";

@Table({
    tableName: 'department'
})

class Department extends Model {
    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare name: string

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        unique: true,
    })
    declare code: string

    @HasMany(() => User)
    users: User[]

    @HasMany(() => Visit)
    visits: Visit[]
}
export default Department;