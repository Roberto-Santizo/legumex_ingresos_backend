import { Model } from "sequelize-typescript";
import User from "./User.model";
import Permission from "./Permission.model";
declare class Role extends Model {
    name: string;
    users: User[];
    permissions: Permission[];
}
export default Role;
