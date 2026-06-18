import { Table, Column, Model, DataType, BelongsToMany } from "sequelize-typescript";
import Role from "./Role.model";
import RolePermission from "./RolePermission.model";

@Table({
    tableName: 'permissions'
})
class Permission extends Model {
    @Column({
        type: DataType.STRING(100),
        unique: true
    })
    declare name: string

    @Column({
        type: DataType.STRING(200),
        allowNull: true
    })
    declare description: string

    @BelongsToMany(() => Role, () => RolePermission)
    declare roles: Role[]
}

export default Permission;
