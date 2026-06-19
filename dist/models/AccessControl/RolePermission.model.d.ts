import { Model } from "sequelize-typescript";
declare class RolePermission extends Model {
    role_id: number;
    permission_id: number;
}
export default RolePermission;
