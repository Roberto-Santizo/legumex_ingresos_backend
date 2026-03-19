import { Table, Column, Model, DataType, HasMany, BelongsToMany } from "sequelize-typescript";
import User from "./User.model";
import Permission from "./Permission.model";
import RolePermission from "./RolePermission.model";

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
    declare users: User[]

    @BelongsToMany(() => Permission, () => RolePermission)
    declare permissions: Permission[]
}

export default Role;