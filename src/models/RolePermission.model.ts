import { Table, Column, Model, ForeignKey, DataType } from "sequelize-typescript";
import Role from "./Role.model";
import Permission from "./Permission.model";

@Table({
    tableName: 'role_permissions',
    timestamps: false
})
class RolePermission extends Model {
    @ForeignKey(() => Role)
    @Column({ type: DataType.INTEGER })
    declare role_id: number

    @ForeignKey(() => Permission)
    @Column({ type: DataType.INTEGER })
    declare permission_id: number
}

export default RolePermission;
