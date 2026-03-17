import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import User from "./User.model";

@Table({
    tableName: 'roles'
})

class Role extends Model {
    @Column({
        type: DataType.STRING(100),
        unique: true
    })
    declare name: string

    @HasMany(() => User)
    users: User[]
}

export default Role;